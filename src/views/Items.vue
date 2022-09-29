<script setup>
import { ref, computed, reactive } from "vue";
import { Carousel, Slide, Pagination, Navigation } from "vue3-carousel";
import "vue3-carousel/dist/carousel.css";
import { useEventBus } from "@vueuse/core";
import {
  useEstatesContract,
  useStakingContract,
  useUser,
  useShoppingApi,
} from "@/composables";
import EstateCardForItems from "../components/EstateCardForItems.vue";
import IconDownload from "@/assets/icons/download.svg";
import useItemStore from "@/stores/item";
import axios from "axios";
import Sidebar from "../components/Sidebar.vue";

const { on: onAppEvent, emit: emitAppEvent } = useEventBus("app");
const { address } = useUser();
const itemStore = useItemStore();
const itemsBucket = itemStore.itemsBucket;
const apiShopping = useShoppingApi();
const open = ref(false);

const inventory = reactive({
  loading: ref(false),
  tokens: ref([]),
});

const availableTokens = computed(() => {
  inventory.tokens.filter(
    (token) =>
      !isTokenLocked(token) && !isTokenSelected(token) && isTokenLoaded(token)
  );
});

const { contract: estates, tokensOfOwner } = useEstatesContract(address);
const {
  contract: staking,
  viewStakes,
  LOCK_IN,
  generationBalance,
} = useStakingContract(address);

const selectedToken = reactive({
  value: ref(),
});

const onTokenLoading = (token) => {
  const index = inventory.tokens.findIndex((t) => t.id === token.id);
  inventory.tokens[index] = {
    ...inventory.tokens[index],
    ...token,
  };
};

const getTokens = async () => {
  try {
    const [unstaked, staked] = await Promise.all([
      tokensOfOwner(),
      viewStakes(),
    ]);

    const result = [
      ...unstaked.map((item) => ({ id: item.toNumber(), status: "unstaked" })),
      ...staked.map((item) => ({ id: item.toNumber(), status: "staked" })),
    ];

    return Promise.resolve(result);
  } catch (err) {
    return Promise.reject(err);
  }
};

const loadInventory = async () => {
  try {
    inventory.loading = true;
    inventory.locktime = await LOCK_IN();
    inventory.tokens = await getTokens();
    console.log("NFTs", inventory.tokens);
    return Promise.resolve(inventory);
  } catch (err) {
    return Promise.reject(err);
  } finally {
    inventory.loading = false;
  }
};

const getItems = async () => {
  try {
    console.log("Get items started");
    const result = await apiShopping.get("/items");
    console.log(result.data);
    return Promise.resolve(result.data);
  } catch (err) {
    return Promise.reject(err);
  }
};

const loadItemsBucket = async () => {
  try {
    itemsBucket.loading = true;
    itemsBucket.items = await getItems();
    itemsBucket.originItems = await getItems();
    console.log("this is items", itemsBucket.items);

    return Promise.resolve(itemsBucket);
  } catch (err) {
    return Promise.reject(console.error());
  } finally {
    itemsBucket.loading = false;
  }
};

const onTokenSelected = (token) => {
  selectedToken.value = token;
  itemStore.setSelectedToken(token);

  apiShopping
    .get(`/items/selected/${token.id}`)
    .then((res) => {
      itemStore.setAssociatedItems(res.data.associatedItems);
    })
    .catch((err) => {});
};

const isTokenSelected = (token) => {
  if (!selectedToken.value) return false;
  return selectedToken.value.id === token.id;
};

const downloadItem = (url, name) => {
  axios
    .get(url, { responseType: "blob" })
    .then((response) => {
      console.log(response);
      const blob = new Blob([response.data], { type: "application/glb" });
      const link = document.createElement("a");
      link.setAttribute("download", name + ".glb");
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
    })
    .catch((err) => {
      console.log(err);
    });
};

const filterBy = (type) => {
  itemStore.filterByItems(type);
};

const toggle = () => {
  open.value = !open.value;
};

onAppEvent(({ type }) => {
  const events = {
    accountsChanged: () => loadInventory(),
  };

  events[type]?.() ?? null;
});

const breakpoints = {
  768: {
    itemsToShow: 2,
    snapAlign: "center",
  },

  // 1024 and up
  1100: {
    itemsToShow: 3,
    snapAlign: "center",
  },
};

loadInventory();
loadItemsBucket();
</script>
<style>
.carousel__prev,
.carousel__next {
  box-sizing: content-box;
  background: transparent;
}
.carousel__prev:hover,
.carousel__next:hover {
  box-sizing: content-box;
  background: #44444411;
}
.inventory-border {
  border: 1px solid #9f6607;
  background: #c182101c;
}
.carousel__pagination-button {
  background-color: rgba(255, 255, 255, 0.425);
}
.carousel__pagination-button--active {
  background-color: white;
}
.items-inventory {
  margin-top: 10px;
  border: 1px solid #9f6607;
}
.reverse {
  grid-auto-flow: row;
}
</style>
<template>
  <div class="self-start w-full py-16">
    <div class="w-[95%] mx-auto">
      <!-- sidebar collapse -->
      <!-- In mobile, will display -->
      <div class="block md:hidden">
        <div class="p-4 inventory-border">
          <carousel
            v-if="inventory.tokens.length !== 0"
            :items-to-show="3"
            :wrap-around="true"
            :breakpoints="breakpoints"
          >
            <slide v-for="token in inventory.tokens" :key="token.id">
              <EstateCardForItems
                :id="token.id"
                as="button"
                :active="isTokenSelected(token)"
                @click="onTokenSelected(token)"
                @load="onTokenLoading"
              />
            </slide>
            <template #addons>
              <Navigation />
              <Pagination />
            </template>
          </carousel>
        </div>
        <div class="p-4 items-inventory">
          <div class="text-center">No items for this estate...</div>
        </div>
      </div>
      <!-- main layout in desktop -->
      <div
        class="grid grid-cols-1 md:grid-cols-12 gap-12 reverse flex-col-reverse"
      >
        <div class="col-span-2">
          <Sidebar />
        </div>
        <div class="col-span-7">
          <div
            v-if="itemsBucket.items.length !== 0"
            class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
          >
            <ItemCard
              as="div"
              v-for="item in itemsBucket.items"
              :isSelectedToken="selectedToken.value ? true : false"
              :item="item"
            />
          </div>
        </div>
        <div class="col-span-3 hidden md:block">
          <div class="p-4 inventory-border">
            <carousel
              :wrap-around="true"
              :breakpoints="breakpoints"
              v-if="inventory.tokens.length !== 0"
            >
              <slide v-for="token in inventory.tokens" :key="token.id">
                <EstateCardForItems
                  :id="token.id"
                  as="button"
                  :active="isTokenSelected(token)"
                  @click="onTokenSelected(token)"
                  @load="onTokenLoading"
                />
              </slide>
              <template #addons>
                <Navigation />
                <Pagination />
              </template>
            </carousel>
          </div>
          <div class="p-4 items-inventory">
            <div class="text-center">
              {{
                selectedToken.value
                  ? selectedToken?.value?.metadata.name
                  : "NFT is Not selected."
              }}
            </div>
            <div v-if="selectedToken.value">
              <div v-if="itemStore.associatedItems.length !== 0">
                <div
                  v-for="item in itemStore.associatedItems"
                  class="flex items-center gap-3 my-2"
                >
                  <div>
                    <img :src="item.image_url" alt="Item" class="w-12 h-12" />
                  </div>

                  <span class="md-list-item-text">{{ item.name }}</span>

                  <button
                    class="md-icon-button md-list-action"
                    @click="downloadItem(item.model_url, item.name)"
                  >
                    <IconDownload class="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div v-else class="text-center">
                No items associated with this NFT
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
