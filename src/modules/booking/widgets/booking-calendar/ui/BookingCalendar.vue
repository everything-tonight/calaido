<script setup lang="ts">
import { addMinutes, differenceInMinutes, format } from 'date-fns'
import { computed, onMounted, ref, useTemplateRef, watch } from 'vue'

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
const sectionRef = useTemplateRef('sectionRef')

interface CalendarEvent {
  id: string
  title: string
  colStart: number
  colEnd: number
  sectionRowStart: number
  sectionRowEnd: number
}

const events = ref<CalendarEvent[]>([])

function loadEvents() {
  try {
    const stored = localStorage.getItem('bookingEvents')
    if (stored)
      events.value = JSON.parse(stored)
  }
  catch {}
}

function saveEvents() {
  localStorage.setItem('bookingEvents', JSON.stringify(events.value))
}

watch(events, saveEvents, { deep: true })
loadEvents()
onMounted(updateEventOverlays)

const showEventForm = ref(false)
const eventTitle = ref('')
const pendingColStart = ref(0)
const pendingColEnd = ref(0)
const pendingSectionRowStart = ref(0)
const pendingSectionRowEnd = ref(0)

const CELL_WIDTH = 72
const CELL_HEIGHT = 56

const eventOverlayStyles = ref<Record<string, { left: string, top: string, width: string, height: string }>>({})
const editingEvent = ref<CalendarEvent | null>(null)
const hoveredEventIds = ref<Set<string>>(new Set())

const selectedColRange = ref<[number, number] | null>(null)
const selectedSectionRowRange = ref<[number, number] | null>(null)

const totalHeight = 56
const totalSections = 6
const sectionHeight = totalHeight / totalSections

const isSelectionStarted = ref(false)

const startCol = ref(0)
const startRow = ref(0)
const startSection = ref(0)

const currentX = ref(0)
const currentY = ref(0)

const hoveredCellEl = ref<HTMLElement | null>(null)
const hoveredSectionIndex = ref(0)
const hoveredEvents = ref<CalendarEvent[]>([])

function updateEventOverlays() {
  if (!gridRef.value || !sectionRef.value)
    return
  const gridRect = gridRef.value.getBoundingClientRect()
  const sectionRect = sectionRef.value.getBoundingClientRect()

  const styles: Record<string, any> = {}
  for (const event of events.value) {
    const left = gridRect.left + event.colStart * CELL_WIDTH
    const top = gridRect.top + event.sectionRowStart * sectionHeight
    const width = (event.colEnd - event.colStart + 1) * CELL_WIDTH
    const height = (event.sectionRowEnd - event.sectionRowStart + 1) * sectionHeight

    const clampedLeft = Math.max(sectionRect.left, left)
    const clampedTop = Math.max(sectionRect.top, top)
    const clampedRight = Math.min(sectionRect.right, left + width)
    const clampedBottom = Math.min(sectionRect.bottom, top + height)
    const cw = clampedRight - clampedLeft
    const ch = clampedBottom - clampedTop

    if (cw > 0 && ch > 0) {
      styles[event.id] = { left: `${clampedLeft}px`, top: `${clampedTop}px`, width: `${cw}px`, height: `${ch}px` }
    }
  }
  eventOverlayStyles.value = styles
}

function confirmEvent() {
  if (!eventTitle.value.trim())
    return

  if (editingEvent.value) {
    editingEvent.value.title = eventTitle.value.trim()
    editingEvent.value = null
  }
  else {
    events.value.push({
      id: crypto.randomUUID(),
      title: eventTitle.value.trim(),
      colStart: pendingColStart.value,
      colEnd: pendingColEnd.value,
      sectionRowStart: pendingSectionRowStart.value,
      sectionRowEnd: pendingSectionRowEnd.value,
    })
  }

  eventTitle.value = ''
  showEventForm.value = false
  updateEventOverlays()
}

function cancelEvent() {
  eventTitle.value = ''
  showEventForm.value = false
  editingEvent.value = null
}

let rafId: number | null = null

function getColRowSection(gridRect: DOMRect, clientX: number, clientY: number) {
  const x = clientX - gridRect.left
  const y = clientY - gridRect.top
  const col = Math.max(0, Math.min(49, Math.floor(x / CELL_WIDTH)))
  const row = Math.max(0, Math.min(timeSlots.value.length - 1, Math.floor(y / CELL_HEIGHT)))
  const yInCell = y - row * CELL_HEIGHT
  const section = Math.min(totalSections - 1, Math.floor(yInCell / sectionHeight))
  return { col, row, section }
}

function updateSelectionRect() {
  if (!isSelectionStarted.value || !gridRef.value || !transparentRectRef.value || !sectionRef.value)
    return

  const sectionRect = sectionRef.value.getBoundingClientRect()
  const gridRect = gridRef.value.getBoundingClientRect()
  const current = getColRowSection(gridRect, currentX.value, currentY.value)

  const startSectionRow = startRow.value * totalSections + startSection.value
  const currentSectionRow = current.row * totalSections + current.section

  const snappedLeft = gridRect.left + Math.min(startCol.value, current.col) * CELL_WIDTH
  const snappedTop = gridRect.top + Math.min(startSectionRow, currentSectionRow) * sectionHeight
  const snappedWidth = (Math.abs(current.col - startCol.value) + 1) * CELL_WIDTH
  const snappedHeight = (Math.abs(currentSectionRow - startSectionRow) + 1) * sectionHeight

  const clampedLeft = Math.max(sectionRect.left, snappedLeft)
  const clampedTop = Math.max(sectionRect.top, snappedTop)
  const clampedRight = Math.min(sectionRect.right, snappedLeft + snappedWidth)
  const clampedBottom = Math.min(sectionRect.bottom, snappedTop + snappedHeight)
  const clampedWidth = clampedRight - clampedLeft
  const clampedHeight = clampedBottom - clampedTop

  if (clampedWidth > 0 && clampedHeight > 0) {
    transparentRectRef.value.style.left = `${clampedLeft}px`
    transparentRectRef.value.style.top = `${clampedTop}px`
    transparentRectRef.value.style.width = `${clampedWidth}px`
    transparentRectRef.value.style.height = `${clampedHeight}px`
  }
  else {
    transparentRectRef.value.style.width = `${0}px`
    transparentRectRef.value.style.height = `${0}px`
  }

  selectedColRange.value = [
    Math.min(startCol.value, current.col),
    Math.max(startCol.value, current.col),
  ]
  selectedSectionRowRange.value = [
    Math.min(startSectionRow, currentSectionRow),
    Math.max(startSectionRow, currentSectionRow),
  ]
}

function updateTooltipPosition() {
  if (!hoveredCellEl.value || !tooltipRef.value || !sectionRef.value)
    return

  const rect = hoveredCellEl.value.getBoundingClientRect()
  const sectionIndex = hoveredSectionIndex.value
  const timeslot = hoveredCellEl.value.getAttribute('data-timeslot')
  if (!timeslot)
    return

  const sectionRect = sectionRef.value.getBoundingClientRect()
  const TOOLTIP_W = 72
  const TOOLTIP_H = hoveredEvents.value.length > 0 ? Math.min(hoveredEvents.value.length * 18 + 4, 60) : 8

  const rawLeft = rect.left
  const rawTop = rect.top + Math.max(0, sectionIndex * sectionHeight - (hoveredEvents.value.length > 0 ? 6 : 0))

  if (rawLeft + TOOLTIP_W <= sectionRect.left || rawLeft >= sectionRect.right
    || rawTop + TOOLTIP_H <= sectionRect.top || rawTop >= sectionRect.bottom) {
    tooltipRef.value.style.width = `${0}px`
    tooltipRef.value.style.height = `${0}px`
    tooltipRef.value.textContent = ''
    return
  }

  const clampedLeft = Math.max(sectionRect.left, Math.min(rawLeft, sectionRect.right - TOOLTIP_W))
  const clampedTop = Math.max(sectionRect.top, Math.min(rawTop, sectionRect.bottom - TOOLTIP_H))

  tooltipRef.value.textContent = hoveredEvents.value.length > 0
    ? hoveredEvents.value.map(e => e.title).join(', ')
    : format(addMinutes(new Date(timeslot), 5 * sectionIndex), 'HH:mm')
  tooltipRef.value.style.left = `${clampedLeft}px`
  tooltipRef.value.style.top = `${clampedTop}px`
  tooltipRef.value.style.width = `${TOOLTIP_W}px`
  tooltipRef.value.style.height = `${TOOLTIP_H}px`
}

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
  const timeslot = target.getAttribute('data-timeslot')
  if (!timeslot)
    return

  const relativeY = e.clientY - rect.top
  const constrainedY = Math.max(0, Math.min(relativeY, totalHeight - 0.01))
  const sectionIndex = Math.floor(constrainedY / sectionHeight)
  const col = Number(target.dataset.col)
  const row = Number(target.dataset.row)
  const sectionRow = row * totalSections + sectionIndex

  hoveredCellEl.value = target
  hoveredSectionIndex.value = sectionIndex
  hoveredEvents.value = col >= 0
    ? events.value.filter(e =>
        col >= e.colStart && col <= e.colEnd
        && sectionRow >= e.sectionRowStart && sectionRow <= e.sectionRowEnd,
      )
    : []
  hoveredEventIds.value = new Set(hoveredEvents.value.map(e => e.id))

  updateTooltipPosition()
}

function startAutoScrollLoop() {
  if (rafId)
    return

  const THRESHOLD = 80
  const SPEED = 15

  function tick() {
    if (!isSelectionStarted.value || !sectionRef.value) {
      rafId = null
      return
    }

    const sectionRect = sectionRef.value.getBoundingClientRect()
    const x = currentX.value
    const y = currentY.value
    let scrolled = false

    if (x < sectionRect.left + THRESHOLD) {
      sectionRef.value.scrollLeft -= SPEED
      scrolled = true
    }
    else if (x > sectionRect.right - THRESHOLD) {
      sectionRef.value.scrollLeft += SPEED
      scrolled = true
    }

    if (y < sectionRect.top + THRESHOLD) {
      sectionRef.value.scrollTop -= SPEED
      scrolled = true
    }
    else if (y > sectionRect.bottom - THRESHOLD) {
      sectionRef.value.scrollTop += SPEED
      scrolled = true
    }

    if (scrolled) {
      updateSelectionRect()
    }

    rafId = requestAnimationFrame(tick)
  }

  rafId = requestAnimationFrame(tick)
}

function stopAutoScrollLoop() {
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
}

function startSelection(e: MouseEvent) {
  isSelectionStarted.value = true
  currentX.value = e.clientX
  currentY.value = e.clientY

  if (gridRef.value) {
    const gridRect = gridRef.value.getBoundingClientRect()
    const pos = getColRowSection(gridRect, e.clientX, e.clientY)
    startCol.value = pos.col
    startRow.value = pos.row
    startSection.value = pos.section
    selectedColRange.value = [pos.col, pos.col]
    selectedSectionRowRange.value = [pos.row * totalSections + pos.section, pos.row * totalSections + pos.section]
  }

  document.addEventListener('mousemove', onDragMove)
  document.addEventListener('mouseup', onDragEnd)

  startAutoScrollLoop()
}

function onDragMove(e: MouseEvent) {
  if (!isSelectionStarted.value)
    return
  currentX.value = e.clientX
  currentY.value = e.clientY
  updateSelectionRect()
}

function onDragEnd() {
  stopSelection()
  document.removeEventListener('mousemove', onDragMove)
  document.removeEventListener('mouseup', onDragEnd)
}

function stopSelection() {
  stopAutoScrollLoop()

  const cr = selectedColRange.value
  const sr = selectedSectionRowRange.value

  isSelectionStarted.value = false
  currentX.value = 0
  currentY.value = 0
  selectedColRange.value = null
  selectedSectionRowRange.value = null

  if (transparentRectRef.value) {
    transparentRectRef.value.style.width = `${0}px`
    transparentRectRef.value.style.height = `${0}px`
    transparentRectRef.value.style.top = `${0}px`
    transparentRectRef.value.style.left = `${0}px`
  }

  if (cr && sr && cr[1] >= cr[0] && sr[1] >= sr[0]) {
    const isClick = cr[0] === cr[1] && sr[0] === sr[1]

    if (isClick) {
      const existing = events.value.find(e =>
        cr[0] >= e.colStart && cr[0] <= e.colEnd
        && sr[0] >= e.sectionRowStart && sr[0] <= e.sectionRowEnd,
      )
      if (existing) {
        editingEvent.value = existing
        eventTitle.value = existing.title
        showEventForm.value = true
        return
      }
    }

    pendingColStart.value = cr[0]
    pendingColEnd.value = cr[1]
    pendingSectionRowStart.value = sr[0]
    pendingSectionRowEnd.value = sr[1]
    showEventForm.value = true
  }
}

function onScroll() {
  updateTooltipPosition()
  updateSelectionRect()
  updateEventOverlays()
}
</script>

<template>
  <section
    ref="sectionRef"
    class="flex overflow-scroll relative bg-[#fafafc] rounded-2xl border border-[#ebeaef]"
    @scroll="onScroll"
  >
    <div ref="calendarCellTooltip" class="bg-[#a79dfd]/25 fixed w-18 h-2 pointer-events-none rounded" />
    <div ref="transparentRect" class="bg-[#a79dfd]/25 fixed pointer-events-none rounded" />
    <div
      v-for="event in events"
      :key="event.id"
      class="bg-[#a79dfd]/40 fixed pointer-events-none rounded text-[10px] text-white p-0.5 overflow-hidden leading-tight transition-transform duration-150"
      :style="{
        ...eventOverlayStyles[event.id],
        transform: hoveredEventIds.has(event.id) ? 'scale(1.08)' : 'scale(1)',
      }"
    >
      {{ event.title }}
    </div>

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
    >
      <article v-for="(_, colIndex) in Array(50)" :key="colIndex">
        <div
          v-for="(timeSlot, rowIndex) in timeSlots"
          :key="timeSlot"
          class="w-18 h-14 border-r border-b border-[#ebeaef]"
          :data-timeslot="timeSlot"
          :data-col="colIndex"
          :data-row="rowIndex"
          @mousemove="moveMouseInTimeSlot"
        />
      </article>
    </div>
  </section>

  <div
    v-if="showEventForm"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/10"
    @mousedown.self="cancelEvent"
  >
    <div class="bg-white rounded-xl p-4 shadow-xl min-w-56">
      <div class="text-xs text-gray-500 mb-1">
        {{ editingEvent ? 'Edit event' : 'New event' }}
      </div>
      <input
        v-model="eventTitle"
        class="border rounded px-2 py-1.5 text-sm w-full mb-3 outline-none focus:border-[#a79dfd]"
        placeholder="Event name"
        @keyup.enter="confirmEvent"
      >
      <div class="flex gap-2 justify-end">
        <button class="text-sm px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200" @click="cancelEvent">
          Cancel
        </button>
        <button class="text-sm px-3 py-1.5 rounded-lg bg-[#a79dfd] text-white hover:bg-[#9288ee]" @click="confirmEvent">
          Save
        </button>
      </div>
    </div>
  </div>
</template>
