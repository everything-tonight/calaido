<script setup lang="ts">
import { addMinutes, differenceInMinutes, format } from 'date-fns'
import { computed, ref, useTemplateRef } from 'vue'

interface Props {
  restaurant: any
}

const { restaurant } = defineProps<Props>()

const timeSlots = computed(() => {
  const slots = []

  let currentSlotTime = restaurant.opening_time
  let minutes = differenceInMinutes(restaurant.closing_time, restaurant.opening_time)

  slots.push(currentSlotTime)

  while (minutes / 30 >= 1) {
    const slotTime = addMinutes(currentSlotTime, 30)

    slots.push(slotTime)

    currentSlotTime = slotTime
    minutes -= 30
  }

  if (minutes > 0) {
    slots.push(addMinutes(currentSlotTime, minutes))
  }

  return slots
})

const tooltipRef = useTemplateRef('calendarCellTooltip')
const transparentRectRef = useTemplateRef('transparentRect')

const totalHeight = 56
const totalSections = 6
const sectionHeight = totalHeight / totalSections

const isSelectionStarted = ref(false)

function moveMouseInTimeSlot(e: MouseEvent) {
  if (isSelectionStarted.value) {
    if (tooltipRef.value) {
      tooltipRef.value.style.width = `0px`
      tooltipRef.value.style.height = `0px`
      tooltipRef.value.textContent = ''
    }

    return
  }

  const target = e.target as HTMLDivElement
  const rect = target.getBoundingClientRect()
  let timeslot = target.getAttribute('data-timeslot')

  if (timeslot) {
    timeslot = new Date(timeslot)
  }

  const relativeY = e.clientY - rect.top

  const constrainedY = Math.max(0, Math.min(relativeY, totalHeight - 0.01))

  const sectionIndex = Math.floor(constrainedY / sectionHeight)

  const globalLeft = rect.left
  const globalTop = rect.top + (sectionIndex * sectionHeight)

  if (tooltipRef.value) {
    tooltipRef.value.textContent = format(addMinutes(timeslot, 5 * sectionIndex), 'HH:mm')
    tooltipRef.value.style.left = `${globalLeft}px`
    tooltipRef.value.style.top = `${globalTop}px`
  }
}

const startX = ref(0)
const startY = ref(0)

const currentX = ref(0)
const currentY = ref(0)

function startSelection(e: MouseEvent) {
  isSelectionStarted.value = true

  startX.value = e.clientX
  startY.value = e.clientY
}

function selecting(e: MouseEvent) {
  if (isSelectionStarted.value) {
    currentX.value = e.clientX
    currentY.value = e.clientY

    const width = Math.abs(currentX.value - startX.value)
    const height = Math.abs(currentY.value - startY.value)

    const left = currentX.value < startX.value ? currentX.value : startX.value
    const top = currentY.value < startY.value ? currentY.value : startY.value

    if (transparentRectRef.value) {
      transparentRectRef.value.style.top = `${top}px`
      transparentRectRef.value.style.left = `${left}px`
      transparentRectRef.value.style.width = `${width}px`
      transparentRectRef.value.style.height = `${height}px`
    }
  }
}

function stopSelection() {
  isSelectionStarted.value = false

  startX.value = 0
  startY.value = 0

  if (transparentRectRef.value) {
    transparentRectRef.value.style.width = `${0}px`
    transparentRectRef.value.style.height = `${0}px`

    transparentRectRef.value.style.top = `${0}px`
    transparentRectRef.value.style.left = `${0}px`
  }
}
</script>

<template>
  <section class="flex overflow-scroll relative bg-[#fafafc] rounded-2xl border border-[#ebeaef]">
    <div ref="calendarCellTooltip" class="bg-[#a79dfd]/25 fixed w-18 h-2 pointer-events-none rounded" />
    <div ref="transparentRect" class="bg-[#a79dfd]/25 fixed pointer-events-none rounded" />

    <div class="flex flex-col h-fit sticky bg-[#fafafc] left-0">
      <div
        v-for="timeSlot in timeSlots"
        :key="timeSlot"
        class="flex place-items-center justify-center w-18 h-14 pr-2 border-r border-[#ebeaef]"
      >
        {{ format(timeSlot, 'HH:mm') }}
      </div>
    </div>

    <div
      class="flex"
      @mousedown.prevent="startSelection"
      @mousemove="selecting"
      @mouseup="stopSelection"
    >
      <article v-for="table in Array(50)" :key="table">
        <div
          v-for="timeSlot in timeSlots"
          :key="timeSlot"
          class="w-18 h-14 border-r border-b border-[#ebeaef]"
          :data-timeslot="timeSlot"
          @mousemove="moveMouseInTimeSlot"
        />
      </article>
    </div>
  </section>
</template>
