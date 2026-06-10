# Admin Components

Admin components ย่อยๆ สำหรับแยกออกจาก Admin.vue

## Components

### DashboardStats.vue
Dashboard หลัก + Quick actions + Today's classes

**Props:**
- `classes: Array` - คลาสทั้งหมด
- `users: Array` - สมาชิกทั้งหมด
- `bookingStats: Object` - สถิติการจอง
- `todayClasses: Array` - คลาสวันนี้
- `upcomingClassesCount: Number`
- `activeMembers: Number`
- `todayBookingsCount: Number`

**Events:**
- `@add-class` - เปิด modal เพิ่มคลาส
- `@view-users` - ไปหน้าจัดการสมาชิก
- `@export-csv` - Export CSV
- `@view-class-types` - ไปหน้าประเภทคลาส
- `@view-all-classes` - ไปหน้าจัดการคลาส

### UserList.vue
รายชื่อสมาชิก + ค้นหา

**Props:**
- `users: Array` - สมาชิกทั้งหมด
- `loading: Boolean`

**Events:**
- `@edit-user` - แก้ไขข้อมูลสมาชิก (ส่ง user object)

### ClassList.vue
รายการคลาส + กรองตามวันที่

**Props:**
- `classes: Array` - คลาสที่กรองแล้ว
- `loading: Boolean`
- `dateFilter: String` - วันที่กรอง (YYYY-MM-DD)

**Events:**
- `@add-class` - เปิด modal เพิ่มคลาส
- `@delete-class` - ลบคลาส (ส่ง classId)
- `@update:dateFilter` - เปลี่ยนวันที่กรอง

## Usage Example

```vue
<template>
  <DashboardStats
    v-if="section === 'dashboard'"
    :classes="classes"
    :users="users"
    :booking-stats="stats"
    :today-classes="todayClasses"
    :upcoming-classes-count="5"
    :active-members="50"
    :today-bookings-count="12"
    @add-class="openModal"
  />
</template>

<script setup>
import DashboardStats from './admin/DashboardStats.vue'
</script>
```
