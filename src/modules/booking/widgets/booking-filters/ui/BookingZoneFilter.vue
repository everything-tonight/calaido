<script setup lang="ts">
import type { BookingFiltersProps } from '../model'

defineProps<Pick<BookingFiltersProps, 'availableZones'>>()

const selectedZones = defineModel<string[]>({
  required: true,
})
</script>

<template>
  <form v-if="availableZones.length > 0">
    <p>Отображаемые зоны</p>

    <div class="flex items-center gap-4 mt-1">
      <label
        v-for="availableZone in availableZones"
        :key="availableZone"
        class="flex flex-col cursor-pointer"
      >
        <input v-model="selectedZones" type="checkbox" :value="availableZone" class="peer sr-only">

        <div class="flex flex-col gap-1 p-2 peer-checked:bg-[#a79dfd] peer-checked:text-white rounded-lg">
          <span>{{ availableZone }}</span>
        </div>
      </label>
    </div>
  </form>
</template>
