import type { Table } from ':modules/booking/entities/table'
import type { Restaurant } from './restaurant.types'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useRestaurantStore = defineStore('restaurant', () => {
  const restaurant = ref<Restaurant>({
    id: 0,
    restaurant_name: '',
    timezone: '',
    closing_time: new Date(),
    opening_time: new Date(),
  })

  const setRestaurant = (newRestaurant: Restaurant) => {
    restaurant.value = newRestaurant

    return newRestaurant
  }

  const tables = ref<Table[]>([])

  const setTables = (newTables: Table[]) => {
    tables.value = newTables

    return newTables
  }

  return {
    restaurant,
    setRestaurant,
    tables,
    setTables,
  }
})
