<script setup>
import { toRefs, ref, reactive } from "vue";
import useItemStore from "@/stores/item";
const contentLines = ref([]);
const itemStore = useItemStore();
function addContentLine() {
  contentLines.value.push("Date now is " + Date.now());
}
function removeContentLine() {
  contentLines.value.pop();
}

const filterBy = (type) => {
  itemStore.filterByItems(type);
};
</script>
<style>
:root {
  --acco-border-radius: 8px;
  --acco-light: transparent;
  --acco-lightest: transparent;
  --acco-dark: #9e9e9e;
  --acco-darkest: rgb(219, 219, 219);
  --acco-active: #ffffff;
}

input[type="radio"] + label span {
  transition: background 0.2s, transform 0.2s;
  border-color: #9f6607;
  color: #8b8b8b;
}

input[type="radio"] + label span:hover,
input[type="radio"] + label:hover span {
  transform: scale(1.1);
  border-color: #9f6607;
}

input[type="radio"]:checked + label span {
  background-color: #9f6607;
  box-shadow: 0px 0px 0px 4px #030e17 inset;
  border-color: #9f6607;
}

input[type="radio"]:checked + label {
  color: #e7e7e7;
}

label {
  color: #c1c1c1;
}

.accordion-list .accordion-item > .accordion-item__summary {
  font-size: 14px;
}

.accordion-list .accordion-item,
.accordion-list .accordion-item--open > .accordion-item__summary {
  border-color: #9f6607;
  border-radius: 0;
}

.accordion-list .accordion-item--open > .accordion-item__summary {
  background-color: #7e55103b;
}
</style>
<template>
  <div>
    <div class="flex items-center mr-4 mb-4">
      <input
        id="radio1"
        type="radio"
        name="radio"
        @change="filterBy('all')"
        class="hidden"
        checked
      />
      <label for="radio1" class="flex items-center cursor-pointer">
        <span class="w-4 h-4 inline-block mr-2 border border-grey"></span>
        All</label
      >
    </div>

    <div class="flex items-center mr-4 mb-4">
      <input
        id="radio2"
        type="radio"
        name="radio"
        class="hidden"
        @change="filterBy('buy')"
      />
      <label for="radio2" class="flex items-center cursor-pointer">
        <span class="w-4 h-4 inline-block mr-2 border border-grey"></span>
        On sale</label
      >
    </div>

    <div class="flex items-center mr-4 mb-4">
      <input
        id="radio3"
        type="radio"
        name="radio"
        class="hidden"
        @change="filterBy('sold')"
      />
      <label for="radio3" class="flex items-center cursor-pointer">
        <span class="w-4 h-4 inline-block mr-2 border border-grey"></span>
        Sold out</label
      >
    </div>
  </div>
  <AccordionList
    v-model:state="state"
    :open-multiple-items="openMultipleItems"
    class="bg-transparent"
  >
    <AccordionItem id="mId1">
      <template #summary
        ><h1 class="text-[#e4e4e4] text-[15px]">Type</h1></template
      >
      <div>
        <input
          type="checkbox"
          name="checkbox-three"
          id="checkbox-three"
          class="bg-transparent hover:bg-[#916c1e] cursor-pointer w-5 h-5 border border-[#9f6607] checked:bg-[#9f6607]"
        />
        <label for="checkbox-one" class="ml-3">Table</label>
      </div>
      <div>
        <input
          type="checkbox"
          name="checkbox-three"
          id="checkbox-three"
          class="bg-transparent hover:bg-[#916c1e] cursor-pointer w-5 h-5 border border-[#9f6607] checked:bg-[#9f6607] checked:outline-none focus:outline-none"
        />
        <label for="checkbox-one" class="ml-3">Pillow</label>
      </div>
    </AccordionItem>
    <AccordionItem id="mId2">
      <template #summary
        ><h1 class="text-[#e4e4e4] text-[15px]">Color</h1></template
      >
      <div>
        <input
          type="checkbox"
          name="checkbox-three"
          id="checkbox-three"
          class="bg-transparent hover:bg-[#916c1e] cursor-pointer w-5 h-5 border border-[#9f6607] checked:bg-[#9f6607]"
        />
        <label for="checkbox-one" class="ml-3">Yellow</label>
      </div>
      <div>
        <input
          type="checkbox"
          name="checkbox-three"
          id="checkbox-three"
          class="bg-transparent hover:bg-[#916c1e] cursor-pointer w-5 h-5 border border-[#9f6607] checked:bg-[#9f6607] checked:outline-none focus:outline-none"
        />
        <label for="checkbox-one" class="ml-3">Pink</label>
      </div>
    </AccordionItem>
  </AccordionList>
</template>
