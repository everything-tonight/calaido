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
const gridRef = useTemplateRef('gridRef')

const CELL_WIDTH = 72
const CELL_HEIGHT = 56

const selectedColRange = ref<[number, number] | null>(null)
const selectedSectionRowRange = ref<[number, number] | null>(null)

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

  const target = e.currentTarget as HTMLDivElement
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

    tooltipRef.value.style.width = `${72}px`
    tooltipRef.value.style.height = `${8}px`
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

    if (gridRef.value) {
      const gridRect = gridRef.value.getBoundingClientRect()

      function getColRowSection(clientX: number, clientY: number) {
        const x = clientX - gridRect.left
        const y = clientY - gridRect.top
        const col = Math.max(0, Math.min(49, Math.floor(x / CELL_WIDTH)))
        const row = Math.max(0, Math.min(timeSlots.value.length - 1, Math.floor(y / CELL_HEIGHT)))
        const yInCell = y - row * CELL_HEIGHT
        const section = Math.min(totalSections - 1, Math.floor(yInCell / sectionHeight))
        return { col, row, section }
      }

      const start = getColRowSection(startX.value, startY.value)
      const current = getColRowSection(currentX.value, currentY.value)

      const startSectionRow = start.row * totalSections + start.section
      const currentSectionRow = current.row * totalSections + current.section

      const snappedLeft = gridRect.left + Math.min(start.col, current.col) * CELL_WIDTH
      const snappedTop = gridRect.top + Math.min(startSectionRow, currentSectionRow) * sectionHeight
      const snappedWidth = (Math.abs(current.col - start.col) + 1) * CELL_WIDTH
      const snappedHeight = (Math.abs(currentSectionRow - startSectionRow) + 1) * sectionHeight

      if (transparentRectRef.value) {
        transparentRectRef.value.style.left = `${snappedLeft}px`
        transparentRectRef.value.style.top = `${snappedTop}px`
        transparentRectRef.value.style.width = `${snappedWidth}px`
        transparentRectRef.value.style.height = `${snappedHeight}px`
      }

      selectedColRange.value = [
        Math.min(start.col, current.col),
        Math.max(start.col, current.col),
      ]
      selectedSectionRowRange.value = [
        Math.min(startSectionRow, currentSectionRow),
        Math.max(startSectionRow, currentSectionRow),
      ]
    }
  }
}

function stopSelection() {
  isSelectionStarted.value = false

  startX.value = 0
  startY.value = 0

  selectedColRange.value = null
  selectedSectionRowRange.value = null

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
      ref="gridRef"
      class="flex"
      @mousedown.prevent="startSelection"
      @mousemove="selecting"
      @mouseup="stopSelection"
    >
      <article v-for="(_, colIndex) in Array(50)" :key="colIndex">
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
