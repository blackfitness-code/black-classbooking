<template>
  <div class="page-container">
    <!-- Header -->
    <header class="page-header">
      <div class="max-w-md mx-auto px-4 py-4 flex items-center">
        <button @click="$router.go(-1)" class="mr-4 text-white hover:bg-white/20 rounded-lg p-2 transition-all">
          <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <h1 class="page-title">จัดการระบบ</h1>
        <button
          @click="refreshData"
          :disabled="loadingClasses || loadingUsers || loadingBookings"
          class="text-white hover:bg-white/20 rounded-lg p-2 transition-all disabled:opacity-40"
          title="รีเฟรชข้อมูล"
        >
          <svg
            :class="['w-5 h-5', (loadingClasses || loadingUsers || loadingBookings) ? 'animate-spin' : '']"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
        </button>
      </div>
    </header>

    <main class="max-w-md mx-auto px-4 py-6">
      <!-- Admin Menu -->
      <div class="space-y-4 mb-6">
        <button
          @click="activeSection = 'classes'"
          :class="[
            'w-full p-4 rounded-lg text-left transition-all',
            activeSection === 'classes'
              ? 'bg-primary text-white'
              : 'bg-white hover:bg-gray-50'
          ]"
        >
          <h3 class="font-semibold">จัดการคลาส</h3>
          <p class="text-sm opacity-80">เพิ่ม แก้ไข ลบคลาส</p>
        </button>

        <button
          @click="activeSection = 'users'"
          :class="[
            'w-full p-4 rounded-lg text-left transition-all',
            activeSection === 'users'
              ? 'bg-primary text-white'
              : 'bg-white hover:bg-gray-50'
          ]"
        >
          <h3 class="font-semibold">จัดการสมาชิก</h3>
          <p class="text-sm opacity-80">ดูรายชื่อ ต่ออายุสมาชิก</p>
        </button>

        <button
          @click="activeSection = 'bookings'"
          :class="[
            'w-full p-4 rounded-lg text-left transition-all',
            activeSection === 'bookings'
              ? 'bg-primary text-white'
              : 'bg-white hover:bg-gray-50'
          ]"
        >
          <h3 class="font-semibold">ดูการจอง</h3>
          <p class="text-sm opacity-80">ประวัติการจองทั้งหมด</p>
        </button>
      </div>

      <!-- Classes Management -->
      <div v-if="activeSection === 'classes'" class="space-y-4">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold">จัดการคลาส</h2>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500">{{ filteredClasses.length }} คลาส</span>
            <button @click="showAddClassModal = true" class="btn-primary flex items-center gap-2">
              <svg class="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              เพิ่มคลาส
            </button>
          </div>
        </div>

        <!-- Date Filter -->
        <div class="mb-4">
          <label class="block text-sm font-medium mb-2">กรองตามวันที่</label>
          <input
            v-model="classDateFilter"
            type="date"
            class="px-3 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-auto"
          >
          <button
            v-if="classDateFilter"
            @click="classDateFilter = ''"
            class="ml-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            ล้างตัวกรอง
          </button>
        </div>

        <div v-if="!loadingClasses" class="space-y-3">
          <div
            v-for="yogaClass in paginatedClasses"
            :key="yogaClass.id"
            class="card"
          >
            <div class="flex justify-between items-start mb-3">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <svg class="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                    <path :d="getClassTypeInfo(yogaClass.type).iconPath"></path>
                  </svg>
                  <h4 class="font-semibold">{{ yogaClass.name }}</h4>
                  <span :class="['inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border', getClassTypeColor(yogaClass.type)]">
                    {{ getClassTypeInfo(yogaClass.type).label }}
                  </span>
                  <span
                    :class="[
                      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                      getClassStatus(yogaClass) === 'upcoming' 
                        ? 'bg-green-100 text-green-800'
                        : getClassStatus(yogaClass) === 'ongoing'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    ]"
                  >
                    {{ getClassStatusText(yogaClass) }}
                  </span>
                </div>
                <p class="text-sm text-gray-600">{{ formatDate(yogaClass.date) }}</p>
                <p class="text-sm text-gray-600">{{ yogaClass.time }}</p>
                <p class="text-sm text-gray-600">ครู: {{ yogaClass.instructor }}</p>
                <p class="text-sm text-gray-600">
                  จอง: {{ yogaClass.currentBookings }}/{{ yogaClass.maxCapacity }}
                </p>
                <p v-if="yogaClass.description" class="text-sm text-gray-500 mt-2 italic">
                  {{ yogaClass.description }}
                </p>
              </div>
              <div class="flex space-x-2">
                <button
                  @click="$router.push(`/class/${yogaClass.id}`)"
                  class="text-purple-500 hover:text-purple-700"
                  title="ดูรายละเอียด"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                </button>
                <button
                  @click="openAddMemberModal(yogaClass)"
                  class="text-green-500 hover:text-green-700"
                  title="เพิ่มสมาชิกเข้าคลาส"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                  </svg>
                </button>
                <button
                  @click="editClass(yogaClass)"
                  class="text-blue-500 hover:text-blue-700"
                  title="แก้ไขคลาส"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                </button>
                <button
                  @click="deleteClass(yogaClass)"
                  class="text-red-500 hover:text-red-700"
                  title="ลบคลาส"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>
            
            <!-- Show bookings for this class -->
            <div v-if="getClassBookings(yogaClass.id).length > 0" class="mt-3 pt-3 border-t border-gray-100">
              <h5 class="text-sm font-medium text-gray-700 mb-2">ผู้จอง:</h5>
              <div class="space-y-2">
                <div 
                  v-for="booking in getClassBookings(yogaClass.id)" 
                  :key="booking.id"
                  class="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg"
                >
                  <img 
                    :src="getUserProfile(booking.userId)?.pictureUrl || '/default-avatar.png'" 
                    :alt="getUserProfile(booking.userId)?.displayName"
                    class="w-8 h-8 rounded-full object-cover"
                  >
                  <div class="flex-1">
                    <p class="text-sm font-medium">
                      {{ getUserProfile(booking.userId)?.nickname || getUserProfile(booking.userId)?.displayName || 'ไม่มีชื่อ' }}
                    </p>
                    <p class="text-xs text-gray-500" v-if="getUserProfile(booking.userId)?.firstName || getUserProfile(booking.userId)?.lastName">
                      {{ getUserProfile(booking.userId)?.firstName }} {{ getUserProfile(booking.userId)?.lastName }}
                    </p>
                  </div>
                  <span class="text-xs text-gray-400">
                    {{ formatTime(booking.bookedAt) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination for Classes -->
        <div v-if="totalClassPages > 1" class="flex justify-between items-center mt-6">
          <div class="text-sm text-gray-500">
            แสดง {{ ((currentClassPage - 1) * classItemsPerPage) + 1 }}-{{ Math.min(currentClassPage * classItemsPerPage, filteredClasses.length) }} 
            จาก {{ filteredClasses.length }} คลาส
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="currentClassPage = Math.max(1, currentClassPage - 1)"
              :disabled="currentClassPage === 1"
              class="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ก่อนหน้า
            </button>
            
            <div class="flex space-x-1">
              <button
                v-for="page in getVisibleClassPages()"
                :key="page"
                @click="currentClassPage = page"
                :class="[
                  'px-3 py-2 text-sm border rounded-lg',
                  currentClassPage === page
                    ? 'bg-primary text-white border-primary'
                    : 'border-gray-300 hover:bg-gray-50'
                ]"
              >
                {{ page }}
              </button>
            </div>
            
            <button
              @click="currentClassPage = Math.min(totalClassPages, currentClassPage + 1)"
              :disabled="currentClassPage === totalClassPages"
              class="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ถัดไป
            </button>
          </div>
        </div>
      </div>

      <!-- Users Management -->
      <div v-if="activeSection === 'users'" class="space-y-4">
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-semibold">จัดการสมาชิก</h2>
          <span class="text-sm text-gray-500">{{ filteredUsers.length }} คน</span>
        </div>
        
        <!-- Search and Filter -->
        <div class="space-y-3">
          <!-- Search -->
          <div class="relative">
            <input
              v-model="userSearch"
              type="text"
              placeholder="ค้นหาสมาชิก..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
            <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          
          <!-- Filters -->
          <div class="flex space-x-2">
            <select v-model="userSortBy" class="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="createdAt">เรียงตามวันที่สมัคร</option>
              <option value="name">เรียงตามชื่อ</option>
              <option value="membership">เรียงตามสมาชิก</option>
              <option value="role">เรียงตาม Role</option>
            </select>
            
            <select v-model="membershipFilter" class="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="all">ทั้งหมด</option>
              <option value="active">สมาชิกใช้งานได้</option>
              <option value="expired">สมาชิกหมดอายุ</option>
              <option value="none">ไม่มีสมาชิก</option>
            </select>
          </div>
        </div>

        <div v-if="!loadingUsers" class="space-y-3">
          <div
            v-for="user in filteredUsers"
            :key="user.id"
            class="card"
          >
            <div class="flex justify-between items-start mb-3">
              <div>
                <h4 class="font-semibold">
                  {{ user.nickname || user.displayName || 'ไม่มีชื่อ' }}
                  <span v-if="user.firstName || user.lastName" class="text-sm text-gray-500">
                    ({{ user.firstName }} {{ user.lastName }})
                  </span>
                </h4>
                <p class="text-sm text-gray-600">
                  สมาชิก: {{ getMembershipExpiryDisplay(user) }}
                </p>
                <p class="text-sm text-gray-600">
                  Role: 
                  <span :class="[
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ml-1',
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                  ]">
                    {{ user.role === 'admin' ? 'Admin' : 'User' }}
                  </span>
                </p>
              </div>
              <span
                :class="[
                  'text-xs px-2 py-1 rounded-full',
                  isMembershipValid(user)
                    ? 'bg-green-100 text-green-600'
                    : 'bg-red-100 text-red-600'
                ]"
              >
                {{ isMembershipValid(user) ? 'ใช้งานได้' : 'หมดอายุ' }}
              </span>
            </div>
            
            <!-- Role Management -->
            <div class="space-y-2 mb-3 pb-3 border-b border-gray-100">
              <label class="block text-sm font-medium text-gray-700">
                จัดการ Role
              </label>
              <div class="flex space-x-2">
                <select
                  :value="user.role || 'user'"
                  @change="updateUserRole(user, $event.target.value)"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                >
                  <option value="user">User (ผู้ใช้ทั่วไป)</option>
                  <option value="admin">Admin (ผู้ดูแลระบบ)</option>
                </select>
              </div>
              <p class="text-xs text-gray-500">
                Admin สามารถเข้าถึงหน้าจัดการระบบได้
              </p>
            </div>
            
            <!-- Date Picker for Membership Expiry -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">
                ตั้งวันหมดอายุสมาชิก
              </label>
              <div class="flex space-x-2">
                <input
                  :value="getMembershipExpiryForInput(user)"
                  @change="updateMembershipExpiry(user, $event.target.value)"
                  type="date"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                >
                <button
                  @click="setMembershipExpiry(user)"
                  class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm"
                >
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bookings Management -->
      <div v-if="activeSection === 'bookings'" class="space-y-4">
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-semibold">ประวัติการจอง</h2>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500">{{ filteredBookings.length }} การจอง</span>
            <button
              @click="exportBookingsToCSV"
              class="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm flex items-center gap-1"
              :disabled="filteredBookings.length === 0"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Export CSV
            </button>
          </div>
        </div>

        <!-- Search and Filter for Bookings -->
        <div class="space-y-3">
          <!-- Search -->
          <div class="relative">
            <input
              v-model="bookingSearch"
              type="text"
              placeholder="ค้นหาชื่อ, คลาส, ครู หรือวันที่..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
            <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <button
              v-if="bookingSearch"
              @click="bookingSearch = ''"
              class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <!-- Filters -->
          <div class="flex flex-wrap gap-2">
            <select v-model="bookingSortBy" class="px-3 py-2 border border-gray-300 rounded-lg text-sm flex-1 sm:flex-none">
              <option value="date-desc">วันที่ (ใหม่ → เก่า)</option>
              <option value="date-asc">วันที่ (เก่า → ใหม่)</option>
              <option value="user-name">ชื่อผู้จอง (A → Z)</option>
              <option value="class-name">ชื่อคลาส (A → Z)</option>
              <option value="instructor">ครูผู้สอน (A → Z)</option>
              <option value="status">สถานะ</option>
            </select>
            
            <select v-model="bookingStatusFilter" class="px-3 py-2 border border-gray-300 rounded-lg text-sm flex-1 sm:flex-none">
              <option value="all">ทุกสถานะ</option>
              <option value="confirmed">ยืนยันแล้ว</option>
              <option value="completed">เสร็จสิ้น</option>
              <option value="cancelled">ยกเลิกแล้ว</option>
            </select>

            <select v-model="bookingDateFilter" class="px-3 py-2 border border-gray-300 rounded-lg text-sm flex-1 sm:flex-none">
              <option value="all">ทุกช่วงเวลา</option>
              <option value="today">วันนี้</option>
              <option value="this-week">สัปดาห์นี้</option>
              <option value="this-month">เดือนนี้</option>
              <option value="upcoming">กำลังจะมา</option>
              <option value="past">ผ่านมาแล้ว</option>
            </select>
          </div>
        </div>

        <!-- Booking Statistics -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="bg-white rounded-xl p-4 text-center border border-gray-100">
            <div class="text-2xl font-bold text-primary">{{ bookingStats.total }}</div>
            <div class="text-xs text-gray-500 mt-1">ทั้งหมด</div>
          </div>
          <div class="bg-white rounded-xl p-4 text-center border border-gray-100">
            <div class="text-2xl font-bold text-green-600">{{ bookingStats.confirmed }}</div>
            <div class="text-xs text-gray-500 mt-1">ยืนยันแล้ว</div>
          </div>
          <div class="bg-white rounded-xl p-4 text-center border border-gray-100">
            <div class="text-2xl font-bold text-blue-600">{{ bookingStats.completed }}</div>
            <div class="text-xs text-gray-500 mt-1">เสร็จสิ้น</div>
          </div>
          <div class="bg-white rounded-xl p-4 text-center border border-gray-100">
            <div class="text-2xl font-bold text-red-600">{{ bookingStats.cancelled }}</div>
            <div class="text-xs text-gray-500 mt-1">ยกเลิกแล้ว</div>
          </div>
        </div>

        <!-- Search Results Info -->
        <div v-if="bookingSearch.trim() && filteredBookings.length > 0" class="text-sm text-gray-600">
          พบ {{ filteredBookings.length }} รายการจากการค้นหา "{{ bookingSearch }}"
        </div>

        <!-- Quick Actions -->
        <div v-if="filteredBookings.length > 0" class="flex flex-wrap gap-2">
          <button
            @click="bookingDateFilter = 'today'"
            :class="[
              'px-3 py-1 rounded-full text-xs font-medium transition-all',
              bookingDateFilter === 'today' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            ]"
          >
            วันนี้ ({{ getTodayBookingsCount() }})
          </button>
          <button
            @click="bookingDateFilter = 'upcoming'"
            :class="[
              'px-3 py-1 rounded-full text-xs font-medium transition-all',
              bookingDateFilter === 'upcoming' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            ]"
          >
            กำลังจะมา ({{ getUpcomingBookingsCount() }})
          </button>
          <button
            @click="bookingStatusFilter = 'confirmed'"
            :class="[
              'px-3 py-1 rounded-full text-xs font-medium transition-all',
              bookingStatusFilter === 'confirmed' 
                ? 'bg-green-500 text-white' 
                : 'bg-green-100 text-green-600 hover:bg-green-200'
            ]"
          >
            ยืนยันแล้ว ({{ bookingStats.confirmed }})
          </button>
          <button
            @click="clearAllFilters"
            v-if="hasActiveFilters"
            class="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600 hover:bg-red-200 transition-all"
          >
            ล้างตัวกรอง
          </button>
        </div>

        <div v-if="!loadingBookings" class="space-y-4">
          <div
            v-for="userGroup in groupedBookings"
            :key="userGroup.userId"
            class="card"
          >
            <!-- User Header -->
            <div class="flex items-center space-x-3 mb-3 pb-3 border-b border-gray-100">
              <img 
                :src="userGroup.user?.pictureUrl || '/default-avatar.png'" 
                :alt="userGroup.user?.displayName"
                class="w-10 h-10 rounded-full object-cover"
              >
              <div class="flex-1">
                <h4 class="font-semibold" v-html="highlightSearchTerm(userGroup.user?.nickname || userGroup.user?.displayName || 'ไม่มีชื่อ')">
                </h4>
                <p class="text-sm text-gray-500" v-if="userGroup.user?.firstName || userGroup.user?.lastName" v-html="highlightSearchTerm(`${userGroup.user?.firstName || ''} ${userGroup.user?.lastName || ''}`.trim())">
                </p>
                <p class="text-xs text-gray-400">{{ userGroup.bookings.length }} การจอง</p>
              </div>
            </div>
            
            <!-- User's Bookings -->
            <div class="space-y-2">
              <div
                v-for="booking in userGroup.bookings"
                :key="booking.id"
                class="flex justify-between items-center p-2 bg-gray-50 rounded-lg"
              >
                <div>
                  <p class="font-medium text-sm" v-html="highlightSearchTerm(booking.className)"></p>
                  <p class="text-xs text-gray-600">
                    <span v-html="highlightSearchTerm(formatDate(booking.date))"></span> 
                    <span v-html="highlightSearchTerm(booking.time)"></span>
                  </p>
                  <p class="text-xs text-gray-600">ครู: <span v-html="highlightSearchTerm(booking.instructor)"></span></p>
                </div>
                <span
                  :class="[
                    'text-xs px-2 py-1 rounded-full',
                    getStatusColor(booking.status)
                  ]"
                >
                  {{ getStatusText(booking.status) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex justify-between items-center mt-6">
          <div class="text-sm text-gray-500">
            แสดง {{ ((currentPage - 1) * itemsPerPage) + 1 }}-{{ Math.min(currentPage * itemsPerPage, filteredBookings.length) }} 
            จาก {{ filteredBookings.length }} รายการ
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="currentPage = Math.max(1, currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ก่อนหน้า
            </button>
            
            <div class="flex space-x-1">
              <button
                v-for="page in getVisiblePages()"
                :key="page"
                @click="currentPage = page"
                :class="[
                  'px-3 py-2 text-sm border rounded-lg',
                  currentPage === page
                    ? 'bg-primary text-white border-primary'
                    : 'border-gray-300 hover:bg-gray-50'
                ]"
              >
                {{ page }}
              </button>
            </div>
            
            <button
              @click="currentPage = Math.min(totalPages, currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ถัดไป
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Edit Class Modal -->
    <div v-if="showEditClassModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl w-full sm:max-w-sm max-h-[90dvh] overflow-y-auto">
        <div class="p-6">
          <h3 class="text-base font-semibold mb-4">แก้ไขคลาส</h3>
          <form @submit.prevent="updateClass" class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1">ประเภทคลาส</label>
              <select
                v-model="editingClass.type"
                required
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base"
              >
                <option v-for="classType in CLASS_TYPES" :key="classType.value" :value="classType.value">
                  {{ classType.icon }} {{ classType.label }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">คลาส</label>
              <select
                v-model="editingClass.subtype"
                required
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base"
              >
                <option value="" disabled>เลือกคลาส</option>
                <option v-for="subtype in editAvailableSubtypes" :key="subtype.value" :value="subtype.value">
                  {{ subtype.label }}
                </option>
              </select>
              <p class="text-xs text-gray-500 mt-1">ชื่อและรายละเอียดจะถูกกำหนดอัตโนมัติตามคลาสที่เลือก</p>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">วันที่</label>
              <input
                v-model="editingClass.date"
                type="date"
                required
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base"
              >
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">เวลา</label>
              <input
                v-model="editingClass.time"
                type="time"
                required
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base"
              >
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">ครูผู้สอน</label>
              <input
                v-model="editingClass.instructor"
                type="text"
                required
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base"
              >
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">จำนวนคนสูงสุด</label>
              <input
                v-model.number="editingClass.maxCapacity"
                type="number"
                min="1"
                required
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base"
              >
            </div>
            <div class="flex gap-3 pt-1">
              <button
                type="button"
                @click="showEditClassModal = false"
                class="btn-secondary flex-1 py-3"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                class="btn-primary flex-1 py-3"
                :disabled="addingClass"
              >
                {{ addingClass ? 'กำลังบันทึก...' : 'บันทึก' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Add Class Modal -->
    <div v-if="showAddClassModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl w-full sm:max-w-sm max-h-[90dvh] overflow-y-auto">
        <div class="p-6">
          <h3 class="text-base font-semibold mb-4">เพิ่มคลาสใหม่</h3>
          <form @submit.prevent="addClass" class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1">ประเภทคลาส</label>
              <select
                v-model="newClass.type"
                required
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base"
              >
                <option v-for="classType in CLASS_TYPES" :key="classType.value" :value="classType.value">
                  {{ classType.icon }} {{ classType.label }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">คลาส</label>
              <select
                v-model="newClass.subtype"
                required
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base"
              >
                <option value="" disabled>เลือกคลาส</option>
                <option v-for="subtype in availableSubtypes" :key="subtype.value" :value="subtype.value">
                  {{ subtype.label }}
                </option>
              </select>
              <p class="text-xs text-gray-500 mt-1">ชื่อและรายละเอียดจะถูกกำหนดอัตโนมัติตามคลาสที่เลือก</p>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">วันที่</label>
              <input
                v-model="newClass.date"
                type="date"
                required
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base"
              >
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">เวลา</label>
              <input
                v-model="newClass.time"
                type="time"
                required
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base"
              >
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">ครูผู้สอน</label>
              <input
                v-model="newClass.instructor"
                type="text"
                required
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base"
              >
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">จำนวนคนสูงสุด</label>
              <input
                v-model.number="newClass.maxCapacity"
                type="number"
                min="1"
                required
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base"
              >
            </div>
            <div class="flex gap-3 pt-1">
              <button
                type="button"
                @click="showAddClassModal = false"
                class="btn-secondary flex-1 py-3"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                class="btn-primary flex-1 py-3"
                :disabled="addingClass"
              >
                {{ addingClass ? 'กำลังเพิ่ม...' : 'เพิ่มคลาส' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <!-- Add Member to Class Modal -->
    <div v-if="showAddMemberModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl w-full max-w-sm max-h-[90dvh] flex flex-col">
        <div class="p-5 border-b border-gray-100">
          <h3 class="text-base font-semibold">เพิ่มสมาชิกเข้าคลาส</h3>
          <p class="text-sm text-gray-500 mt-0.5">{{ addMemberTargetClass?.name }} — {{ addMemberTargetClass ? formatDate(addMemberTargetClass.date) : '' }} {{ addMemberTargetClass?.time }}</p>
          <!-- Search -->
          <div class="relative mt-3">
            <input
              v-model="addMemberSearch"
              type="text"
              placeholder="ค้นหาสมาชิก..."
              class="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
            >
            <svg class="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>

        <!-- User list -->
        <div class="overflow-y-auto flex-1 p-3 space-y-2">
          <div
            v-for="user in filteredAddMemberUsers"
            :key="user.id"
            @click="toggleMemberSelection(user)"
            :class="[
              'flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all',
              selectedMembersToAdd.includes(user.lineUserId)
                ? 'bg-primary/10 border-2 border-primary'
                : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
            ]"
          >
            <img
              :src="user.pictureUrl || '/default-avatar.png'"
              class="w-10 h-10 rounded-full object-cover shrink-0"
            >
            <div class="flex-1 min-w-0">
              <p class="font-medium text-sm truncate">{{ user.nickname || user.displayName || 'ไม่มีชื่อ' }}</p>
              <p v-if="user.firstName || user.lastName" class="text-xs text-gray-500 truncate">{{ user.firstName }} {{ user.lastName }}</p>
            </div>
            <div v-if="isAlreadyBooked(user)" class="text-xs text-gray-400 shrink-0">จองแล้ว</div>
            <svg v-else-if="selectedMembersToAdd.includes(user.lineUserId)" class="w-5 h-5 text-primary shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          </div>
          <p v-if="filteredAddMemberUsers.length === 0" class="text-center text-sm text-gray-400 py-6">ไม่พบสมาชิก</p>
        </div>

        <div class="p-4 border-t border-gray-100 flex gap-3">
          <button @click="showAddMemberModal = false" class="btn-secondary flex-1 py-3">
            ยกเลิก
          </button>
          <button
            @click="confirmAddMembers"
            :disabled="selectedMembersToAdd.length === 0 || addingMember"
            class="btn-primary flex-1 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ addingMember ? 'กำลังเพิ่ม...' : `เพิ่ม (${selectedMembersToAdd.length})` }}
          </button>
        </div>
      </div>
    </div>
    <LoadingOverlay 
      :show="loadingClasses" 
      title="กำลังโหลดคลาส"
      subtitle="กรุณารอสักครู่..."
    />
    <LoadingOverlay 
      :show="loadingUsers" 
      title="กำลังโหลดสมาชิก"
      subtitle="กรุณารอสักครู่..."
    />
    <LoadingOverlay 
      :show="loadingBookings" 
      title="กำลังโหลดประวัติการจอง"
      subtitle="กรุณารอสักครู่..."
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import { db } from '../firebase'
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, Timestamp, increment } from 'firebase/firestore'
import { format, addDays } from 'date-fns'
import { th } from 'date-fns/locale'
import Swal from 'sweetalert2'
import LoadingOverlay from '../components/LoadingOverlay.vue'
import { CLASS_TYPES, getClassTypeInfo, getClassTypeColor, getClassSubtypes, getClassSubtypeInfo } from '../constants/classTypes'
import { getCachedData, setCachedData, clearCache, CACHE_KEYS } from '../utils/cache'

const authStore = useAuthStore()

const activeSection = ref('classes')
const classes = ref([])
const users = ref([])
const allBookings = ref([])
const classBookings = ref([])
const loadingClasses = ref(false)
const loadingUsers = ref(false)
const loadingBookings = ref(false)

// Class date filter
const classDateFilter = ref('')

// Search and filter states
const userSearch = ref('')
const userSortBy = ref('createdAt') // เปลี่ยน default เป็นวันที่สมัคร
const membershipFilter = ref('all')

// Booking search and filter states
const bookingSearch = ref('')
const bookingSortBy = ref('date-desc')
const bookingStatusFilter = ref('all')
const bookingDateFilter = ref('all')

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Pagination for classes
const currentClassPage = ref(1)
const classItemsPerPage = ref(10)

// Edit states
const showEditClassModal = ref(false)
const editingClass = ref(null)

const showAddClassModal = ref(false)
const addingClass = ref(false)
const newClass = ref({
  type: 'yoga',
  subtype: '',
  date: '',
  time: '',
  instructor: '',
  maxCapacity: 10
})

const availableSubtypes = computed(() => {
  return getClassSubtypes(newClass.value.type)
})

const editAvailableSubtypes = computed(() => {
  return editingClass.value ? getClassSubtypes(editingClass.value.type) : []
})

// Filtered classes by date
const filteredClasses = computed(() => {
  if (!classDateFilter.value) {
    return classes.value
  }
  
  return classes.value.filter(yogaClass => yogaClass.date === classDateFilter.value)
})

// Watch for type change to reset subtype
watch(() => newClass.value.type, (newType) => {
  newClass.value.subtype = ''
})

watch(() => editingClass.value?.type, (newType) => {
  if (editingClass.value) {
    editingClass.value.subtype = ''
  }
})

// Pagination for classes
const paginatedClasses = computed(() => {
  const startIndex = (currentClassPage.value - 1) * classItemsPerPage.value
  const endIndex = startIndex + classItemsPerPage.value
  return filteredClasses.value.slice(startIndex, endIndex)
})

const totalClassPages = computed(() => {
  return Math.ceil(filteredClasses.value.length / classItemsPerPage.value)
})

const getVisibleClassPages = () => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentClassPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalClassPages.value, start + maxVisible - 1)
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
}

const formatDate = (dateString) => {
  if (!dateString) return 'ไม่มีข้อมูล'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'วันที่ไม่ถูกต้อง'
    return format(date, 'dd MMMM yyyy', { locale: th })
  } catch (error) {
    console.error('Error formatting date:', dateString, error)
    return 'วันที่ไม่ถูกต้อง'
  }
}

const getClassStatus = (yogaClass) => {
  const now = new Date()
  const classStart = new Date(`${yogaClass.date}T${yogaClass.time}`)
  const classEnd = new Date(classStart.getTime() + (90 * 60 * 1000)) // Assume 90 minutes class
  
  if (now < classStart) {
    return 'upcoming'
  } else if (now >= classStart && now <= classEnd) {
    return 'ongoing'
  } else {
    return 'completed'
  }
}

const getClassStatusText = (yogaClass) => {
  const status = getClassStatus(yogaClass)
  const statusMap = {
    upcoming: 'กำลังจะมา',
    ongoing: 'กำลังดำเนินการ',
    completed: 'เสร็จสิ้น'
  }
  return statusMap[status] || 'ไม่ทราบสถานะ'
}

const upcomingClasses = computed(() => {
  const now = new Date()
  return classes.value.filter(yogaClass => {
    const classDateTime = new Date(`${yogaClass.date}T${yogaClass.time}`)
    return classDateTime >= now
  })
})

const pastClasses = computed(() => {
  const now = new Date()
  return classes.value.filter(yogaClass => {
    const classDateTime = new Date(`${yogaClass.date}T${yogaClass.time}`)
    return classDateTime < now
  })
})

const formatTime = (timestamp) => {
  if (!timestamp) return 'ไม่มีข้อมูล'
  try {
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp)
    if (isNaN(date.getTime())) return 'เวลาไม่ถูกต้อง'
    return format(date, 'HH:mm', { locale: th })
  } catch (error) {
    console.error('Error formatting time:', timestamp, error)
    return 'เวลาไม่ถูกต้อง'
  }
}

const getClassBookings = (classId) => {
  return classBookings.value.filter(booking => 
    booking.classId === classId && booking.status === 'confirmed'
  )
}

const getUserProfile = (userId) => {
  return users.value.find(user => user.lineUserId === userId)
}

const filteredUsers = computed(() => {
  let filtered = users.value
  
  // Search filter
  if (userSearch.value) {
    const search = userSearch.value.toLowerCase()
    filtered = filtered.filter(user => {
      const nickname = (user.nickname || '').toLowerCase()
      const displayName = (user.displayName || '').toLowerCase()
      const firstName = (user.firstName || '').toLowerCase()
      const lastName = (user.lastName || '').toLowerCase()
      
      return nickname.includes(search) || 
             displayName.includes(search) || 
             firstName.includes(search) || 
             lastName.includes(search)
    })
  }
  
  // Membership filter
  if (membershipFilter.value !== 'all') {
    filtered = filtered.filter(user => {
      const isValid = isMembershipValid(user)
      const hasExpiry = !!user.membershipExpiry
      
      switch (membershipFilter.value) {
        case 'active': return isValid
        case 'expired': return hasExpiry && !isValid
        case 'none': return !hasExpiry
        default: return true
      }
    })
  }
  
  // Sort
  filtered.sort((a, b) => {
    switch (userSortBy.value) {
      case 'createdAt':
        // เรียงตามวันที่สมัคร (ล่าสุดก่อน)
        const createdA = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt)) : new Date(0)
        const createdB = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt)) : new Date(0)
        return createdB - createdA
      
      case 'name':
        const nameA = a.nickname || a.displayName || ''
        const nameB = b.nickname || b.displayName || ''
        return nameA.localeCompare(nameB)
      
      case 'membership':
        const expiryA = a.membershipExpiry ? new Date(a.membershipExpiry) : new Date(0)
        const expiryB = b.membershipExpiry ? new Date(b.membershipExpiry) : new Date(0)
        return expiryB - expiryA
      
      case 'role':
        const roleA = a.role || 'user'
        const roleB = b.role || 'user'
        return roleA.localeCompare(roleB)
      
      default:
        return 0
    }
  })
  
  return filtered
})

const filteredBookings = computed(() => {
  let filtered = [...allBookings.value]
  
  // Search filter
  if (bookingSearch.value.trim()) {
    const search = bookingSearch.value.toLowerCase().trim()
    filtered = filtered.filter(booking => {
      const user = getUserProfile(booking.userId)
      const searchableText = [
        booking.className,
        booking.instructor,
        formatDate(booking.date),
        booking.time,
        getStatusText(booking.status),
        user?.nickname || '',
        user?.displayName || '',
        user?.firstName || '',
        user?.lastName || ''
      ].join(' ').toLowerCase()
      
      return searchableText.includes(search)
    })
  }
  
  // Status filter
  if (bookingStatusFilter.value !== 'all') {
    filtered = filtered.filter(booking => booking.status === bookingStatusFilter.value)
  }
  
  // Date filter
  if (bookingDateFilter.value !== 'all') {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisWeekStart = new Date(today)
    thisWeekStart.setDate(today.getDate() - today.getDay())
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    
    filtered = filtered.filter(booking => {
      const bookingDate = new Date(booking.date)
      const bookingDateTime = new Date(`${booking.date}T${booking.time}:00`)
      
      switch (bookingDateFilter.value) {
        case 'today':
          return bookingDate.toDateString() === today.toDateString()
        case 'this-week':
          return bookingDate >= thisWeekStart
        case 'this-month':
          return bookingDate >= thisMonthStart
        case 'upcoming':
          return bookingDateTime >= now && booking.status !== 'cancelled'
        case 'past':
          return bookingDateTime < now || booking.status === 'cancelled'
        default:
          return true
      }
    })
  }
  
  // Sort
  filtered.sort((a, b) => {
    const userA = getUserProfile(a.userId)
    const userB = getUserProfile(b.userId)
    const dateA = new Date(`${a.date}T${a.time}:00`)
    const dateB = new Date(`${b.date}T${b.time}:00`)
    
    switch (bookingSortBy.value) {
      case 'date-asc':
        return dateA - dateB
      case 'date-desc':
        return dateB - dateA
      case 'user-name':
        const nameA = userA?.nickname || userA?.displayName || ''
        const nameB = userB?.nickname || userB?.displayName || ''
        return nameA.localeCompare(nameB, 'th')
      case 'class-name':
        return a.className.localeCompare(b.className, 'th')
      case 'instructor':
        return a.instructor.localeCompare(b.instructor, 'th')
      case 'status':
        const statusOrder = { confirmed: 1, completed: 2, cancelled: 3 }
        return (statusOrder[a.status] || 4) - (statusOrder[b.status] || 4)
      default:
        return dateB - dateA
    }
  })
  
  return filtered
})

const bookingStats = computed(() => {
  return {
    total: allBookings.value.length,
    confirmed: allBookings.value.filter(b => b.status === 'confirmed').length,
    completed: allBookings.value.filter(b => b.status === 'completed').length,
    cancelled: allBookings.value.filter(b => b.status === 'cancelled').length
  }
})

const paginatedBookings = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage.value
  const endIndex = startIndex + itemsPerPage.value
  return filteredBookings.value.slice(startIndex, endIndex)
})

const totalPages = computed(() => {
  return Math.ceil(filteredBookings.value.length / itemsPerPage.value)
})

const groupedBookings = computed(() => {
  const groups = {}
  
  paginatedBookings.value.forEach(booking => {
    if (!groups[booking.userId]) {
      groups[booking.userId] = {
        userId: booking.userId,
        user: getUserProfile(booking.userId),
        bookings: []
      }
    }
    groups[booking.userId].bookings.push(booking)
  })
  
  // Sort bookings within each group by date (newest first)
  Object.values(groups).forEach(group => {
    group.bookings.sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`))
  })
  
  // Sort groups by total number of bookings (most active users first)
  return Object.values(groups).sort((a, b) => b.bookings.length - a.bookings.length)
})

const getStatusText = (status) => {
  const statusMap = {
    confirmed: 'ยืนยันแล้ว',
    cancelled: 'ยกเลิกแล้ว',
    completed: 'เสร็จสิ้น'
  }
  return statusMap[status] || status
}

const getStatusColor = (status) => {
  const colorMap = {
    confirmed: 'bg-green-100 text-green-600',
    cancelled: 'bg-red-100 text-red-600',
    completed: 'bg-blue-100 text-blue-600'
  }
  return colorMap[status] || 'bg-gray-100 text-gray-600'
}

const isMembershipValid = (user) => {
  if (!user.membershipExpiry) return false
  const expiry = user.membershipExpiry.toDate ? 
    user.membershipExpiry.toDate() : 
    new Date(user.membershipExpiry)
  return expiry > new Date()
}

// โหลดข้อมูลทั้งหมดครั้งเดียว
const loadAllData = async (forceRefresh = false) => {
  try {
    // ลองอ่านจาก cache ก่อน (ถ้าไม่ใช่ force refresh)
    if (!forceRefresh) {
      const cachedClasses = getCachedData(CACHE_KEYS.ADMIN_CLASSES)
      const cachedUsers = getCachedData(CACHE_KEYS.ADMIN_USERS)
      const cachedBookings = getCachedData(CACHE_KEYS.ADMIN_BOOKINGS)
      
      if (cachedClasses && cachedUsers && cachedBookings) {
        console.log('📦 Using cached data')
        classes.value = cachedClasses
        users.value = cachedUsers
        classBookings.value = cachedBookings
        allBookings.value = cachedBookings
        return
      }
    }
    
    console.log('🔄 Loading fresh data from Firestore')
    // โหลดทั้ง 3 collections พร้อมกัน
    const [classesSnapshot, usersSnapshot, bookingsSnapshot] = await Promise.all([
      getDocs(collection(db, 'classes')),
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'bookings'))
    ])
    
    // Process classes
    classes.value = classesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).sort((a, b) => {
      const now = new Date()
      const dateA = new Date(`${a.date}T${a.time}`)
      const dateB = new Date(`${b.date}T${b.time}`)
      
      const aIsPast = dateA < now
      const bIsPast = dateB < now
      
      if (aIsPast && !bIsPast) return 1
      if (!aIsPast && bIsPast) return -1
      
      if (!aIsPast && !bIsPast) {
        return dateA - dateB
      }
      
      return dateB - dateA
    })
    
    // Process users
    users.value = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    // Process bookings (ใช้ร่วมกันทั้ง classBookings และ allBookings)
    const bookingsData = bookingsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    classBookings.value = bookingsData
    allBookings.value = bookingsData.sort((a, b) => 
      new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`)
    )
    
    // บันทึกลง cache
    setCachedData(CACHE_KEYS.ADMIN_CLASSES, classes.value)
    setCachedData(CACHE_KEYS.ADMIN_USERS, users.value)
    setCachedData(CACHE_KEYS.ADMIN_BOOKINGS, bookingsData)
    console.log('💾 Data cached successfully')
    
  } catch (error) {
    console.error('Error loading data:', error)
  }
}

const refreshData = async () => {
  console.log('🔄 Refreshing data...')
  loadingClasses.value = true
  loadingUsers.value = true
  loadingBookings.value = true
  
  await loadAllData(true) // Force refresh
  
  loadingClasses.value = false
  loadingUsers.value = false
  loadingBookings.value = false
}

const loadClasses = async () => {
  loadingClasses.value = true
  try {
    await loadAllData()
  } catch (error) {
    console.error('Error loading classes:', error)
  } finally {
    loadingClasses.value = false
  }
}

const loadUsers = async () => {
  loadingUsers.value = true
  try {
    if (users.value.length === 0) {
      await loadAllData()
    }
  } catch (error) {
    console.error('Error loading users:', error)
  } finally {
    loadingUsers.value = false
  }
}

const loadBookings = async () => {
  loadingBookings.value = true
  try {
    if (allBookings.value.length === 0) {
      await loadAllData()
    }
  } catch (error) {
    console.error('Error loading bookings:', error)
  } finally {
    loadingBookings.value = false
  }
}

const editClass = (yogaClass) => {
  editingClass.value = { ...yogaClass }
  showEditClassModal.value = true
}

const updateClass = async () => {
  if (!editingClass.value) return
  
  addingClass.value = true
  try {
    // Get class info from subtype
    const subtypeInfo = getClassSubtypeInfo(editingClass.value.type, editingClass.value.subtype)
    if (!subtypeInfo) {
      throw new Error('ไม่พบข้อมูลคลาส')
    }
    
    const { id } = editingClass.value
    await updateDoc(doc(db, 'classes', id), {
      type: editingClass.value.type,
      subtype: editingClass.value.subtype,
      name: subtypeInfo.label,
      description: subtypeInfo.description,
      date: editingClass.value.date,
      time: editingClass.value.time,
      instructor: editingClass.value.instructor,
      maxCapacity: editingClass.value.maxCapacity,
      updatedAt: new Date()
    })
    
    showEditClassModal.value = false
    editingClass.value = null
    await loadAllData(true) // Force refresh หลังแก้ไข
    
    Swal.fire({
      title: 'สำเร็จ!',
      text: 'แก้ไขคลาสสำเร็จ!',
      icon: 'success',
      confirmButtonText: 'ตกลง'
    })
  } catch (error) {
    console.error('Error updating class:', error)
    Swal.fire({
      title: 'เกิดข้อผิดพลาด!',
      text: 'เกิดข้อผิดพลาดในการแก้ไขคลาส',
      icon: 'error',
      confirmButtonText: 'ตกลง'
    })
  } finally {
    addingClass.value = false
  }
}

const addClass = async () => {
  addingClass.value = true
  try {
    // Get class info from subtype
    const subtypeInfo = getClassSubtypeInfo(newClass.value.type, newClass.value.subtype)
    if (!subtypeInfo) {
      throw new Error('ไม่พบข้อมูลคลาส')
    }
    
    await addDoc(collection(db, 'classes'), {
      type: newClass.value.type,
      subtype: newClass.value.subtype,
      name: subtypeInfo.label,
      description: subtypeInfo.description,
      date: newClass.value.date,
      time: newClass.value.time,
      instructor: newClass.value.instructor,
      maxCapacity: newClass.value.maxCapacity,
      currentBookings: 0,
      createdAt: new Date()
    })
    
    // Reset form
    newClass.value = {
      type: 'yoga',
      subtype: '',
      date: '',
      time: '',
      instructor: '',
      maxCapacity: 10
    }
    
    showAddClassModal.value = false
    await loadAllData(true) // Force refresh หลังเพิ่ม
    
    Swal.fire({
      title: 'สำเร็จ!',
      text: 'เพิ่มคลาสสำเร็จ!',
      icon: 'success',
      confirmButtonText: 'ตกลง'
    })
  } catch (error) {
    console.error('Error adding class:', error)
    Swal.fire({
      title: 'เกิดข้อผิดพลาด!',
      text: 'เกิดข้อผิดพลาดในการเพิ่มคลาส',
      icon: 'error',
      confirmButtonText: 'ตกลง'
    })
  } finally {
    addingClass.value = false
  }
}

const deleteClass = async (yogaClass) => {
  const result = await Swal.fire({
    title: 'ยืนยันการลบ',
    text: `คุณแน่ใจหรือไม่ที่จะลบคลาส "${yogaClass.name}"?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'ลบ',
    cancelButtonText: 'ยกเลิก'
  })
  
  if (!result.isConfirmed) return
  
  try {
    await deleteDoc(doc(db, 'classes', yogaClass.id))
    await loadAllData(true) // Force refresh หลังลบ
    Swal.fire({
      title: 'สำเร็จ!',
      text: 'ลบคลาสสำเร็จ!',
      icon: 'success',
      confirmButtonText: 'ตกลง'
    })
  } catch (error) {
    console.error('Error deleting class:', error)
    Swal.fire({
      title: 'เกิดข้อผิดพลาด!',
      text: 'เกิดข้อผิดพลาดในการลบคลาส',
      icon: 'error',
      confirmButtonText: 'ตกลง'
    })
  }
}

// Store selected dates for each user
const selectedDates = ref({})

const getMembershipExpiryForInput = (user) => {
  // Return stored selected date or current expiry date
  if (selectedDates.value[user.id]) {
    return selectedDates.value[user.id]
  }
  
  if (user.membershipExpiry) {
    try {
      const expiry = user.membershipExpiry.toDate ? 
        user.membershipExpiry.toDate() : 
        new Date(user.membershipExpiry)
      if (isNaN(expiry.getTime())) {
        return new Date().toISOString().split('T')[0]
      }
      return expiry.toISOString().split('T')[0]
    } catch (error) {
      console.error('Error getting membership expiry:', error)
      return new Date().toISOString().split('T')[0]
    }
  }
  
  // Default to today if no expiry date
  return new Date().toISOString().split('T')[0]
}

const getMembershipExpiryDisplay = (user) => {
  if (!user.membershipExpiry) return 'ไม่มี'
  try {
    const expiry = user.membershipExpiry.toDate ? 
      user.membershipExpiry.toDate() : 
      new Date(user.membershipExpiry)
    if (isNaN(expiry.getTime())) return 'วันที่ไม่ถูกต้อง'
    return formatDate(expiry.toISOString().split('T')[0])
  } catch (error) {
    console.error('Error displaying membership expiry:', error)
    return 'วันที่ไม่ถูกต้อง'
  }
}

const updateMembershipExpiry = (user, dateValue) => {
  // Store the selected date temporarily
  selectedDates.value[user.id] = dateValue
}

const highlightSearchTerm = (text, searchTerm = null) => {
  const query = searchTerm || bookingSearch.value.trim()
  if (!query) return text
  
  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>')
}

const getTodayBookingsCount = () => {
  const today = new Date().toDateString()
  return allBookings.value.filter(booking => 
    new Date(booking.date).toDateString() === today
  ).length
}

const getUpcomingBookingsCount = () => {
  const now = new Date()
  return allBookings.value.filter(booking => {
    const bookingDateTime = new Date(`${booking.date}T${booking.time}:00`)
    return bookingDateTime >= now && booking.status !== 'cancelled'
  }).length
}

const hasActiveFilters = computed(() => {
  return bookingSearch.value.trim() || 
         bookingStatusFilter.value !== 'all' || 
         bookingDateFilter.value !== 'all' ||
         bookingSortBy.value !== 'date-desc'
})

const clearAllFilters = () => {
  bookingSearch.value = ''
  bookingStatusFilter.value = 'all'
  bookingDateFilter.value = 'all'
  bookingSortBy.value = 'date-desc'
  currentPage.value = 1
}

const getVisiblePages = () => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
}

const exportBookingsToCSV = () => {
  if (filteredBookings.value.length === 0) {
    Swal.fire({
      title: 'ไม่มีข้อมูล',
      text: 'ไม่มีข้อมูลการจองให้ export',
      icon: 'warning',
      confirmButtonText: 'ตกลง'
    })
    return
  }
  
  // CSV headers
  const headers = [
    'วันที่จอง',
    'เวลา',
    'ชื่อคลาส',
    'ครูผู้สอน',
    'ชื่อผู้จอง',
    'ชื่อจริง',
    'นามสกุล',
    'สถานะ',
    'วันที่ทำการจอง'
  ]
  
  // CSV data
  const csvData = filteredBookings.value.map(booking => {
    const user = getUserProfile(booking.userId)
    let bookedAtDate = ''
    if (booking.bookedAt) {
      try {
        const date = booking.bookedAt.toDate ? booking.bookedAt.toDate() : new Date(booking.bookedAt)
        if (!isNaN(date.getTime())) {
          bookedAtDate = formatDate(date.toISOString().split('T')[0])
        }
      } catch (error) {
        console.error('Error formatting bookedAt date:', error)
      }
    }
    return [
      formatDate(booking.date),
      booking.time,
      booking.className,
      booking.instructor,
      user?.nickname || user?.displayName || 'ไม่มีชื่อ',
      user?.firstName || '',
      user?.lastName || '',
      getStatusText(booking.status),
      bookedAtDate
    ]
  })
  
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')
  
  // Create and download file
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `yoga-bookings-${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  Swal.fire({
    title: 'สำเร็จ!',
    text: 'Export ข้อมูลการจองสำเร็จ!',
    icon: 'success',
    confirmButtonText: 'ตกลง'
  })
}

const setMembershipExpiry = async (user) => {
  try {
    const selectedDate = selectedDates.value[user.id]
    if (!selectedDate) {
      Swal.fire({
        title: 'กรุณาเลือกวันที่',
        text: 'กรุณาเลือกวันหมดอายุสมาชิก',
        icon: 'warning',
        confirmButtonText: 'ตกลง'
      })
      return
    }
    
    const newExpiry = new Date(selectedDate)
    
    await updateDoc(doc(db, 'users', user.id), {
      membershipExpiry: Timestamp.fromDate(newExpiry),
      updatedAt: new Date()
    })
    
    // Clear the stored date
    delete selectedDates.value[user.id]
    
    await loadAllData(true) // Force refresh หลังอัพเดต membership
    Swal.fire({
      title: 'สำเร็จ!',
      text: 'ตั้งวันหมดอายุสมาชิกสำเร็จ!',
      icon: 'success',
      confirmButtonText: 'ตกลง'
    })
  } catch (error) {
    console.error('Error setting membership expiry:', error)
    Swal.fire({
      title: 'เกิดข้อผิดพลาด!',
      text: 'เกิดข้อผิดพลาดในการตั้งวันหมดอายุ',
      icon: 'error',
      confirmButtonText: 'ตกลง'
    })
  }
}

const updateUserRole = async (user, newRole) => {
  try {
    const result = await Swal.fire({
      title: 'ยืนยันการเปลี่ยน Role',
      html: `คุณต้องการเปลี่ยน Role ของ <strong>${user.nickname || user.displayName || 'ผู้ใช้'}</strong><br>เป็น <strong>${newRole === 'admin' ? 'Admin' : 'User'}</strong> หรือไม่?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก'
    })
    
    if (!result.isConfirmed) {
      // Reset select to original value
      await loadAllData()
      return
    }
    
    await updateDoc(doc(db, 'users', user.id), {
      role: newRole,
      updatedAt: new Date()
    })
    
    await loadAllData()
    
    Swal.fire({
      title: 'สำเร็จ!',
      text: `เปลี่ยน Role เป็น ${newRole === 'admin' ? 'Admin' : 'User'} สำเร็จ!`,
      icon: 'success',
      confirmButtonText: 'ตกลง'
    })
  } catch (error) {
    console.error('Error updating user role:', error)
    Swal.fire({
      title: 'เกิดข้อผิดพลาด!',
      text: 'เกิดข้อผิดพลาดในการเปลี่ยน Role',
      icon: 'error',
      confirmButtonText: 'ตกลง'
    })
    // Reload to reset the select
    await loadAllData()
  }
}

// Reset pagination when filters change
watch([bookingSearch, bookingStatusFilter, bookingDateFilter, bookingSortBy], () => {
  currentPage.value = 1
})

// Reset class pagination when date filter changes
watch(classDateFilter, () => {
  currentClassPage.value = 1
})

// Add Member to Class
const showAddMemberModal = ref(false)
const addMemberTargetClass = ref(null)
const addMemberSearch = ref('')
const selectedMembersToAdd = ref([])
const addingMember = ref(false)

const openAddMemberModal = (yogaClass) => {
  addMemberTargetClass.value = yogaClass
  addMemberSearch.value = ''
  selectedMembersToAdd.value = []
  showAddMemberModal.value = true
}

const isAlreadyBooked = (user) => {
  if (!addMemberTargetClass.value) return false
  return classBookings.value.some(
    b => b.classId === addMemberTargetClass.value.id &&
         b.userId === user.lineUserId &&
         b.status !== 'cancelled'
  )
}

const filteredAddMemberUsers = computed(() => {
  const search = addMemberSearch.value.toLowerCase()
  return users.value.filter(user => {
    if (!search) return true
    return [user.nickname, user.displayName, user.firstName, user.lastName]
      .filter(Boolean).join(' ').toLowerCase().includes(search)
  })
})

const toggleMemberSelection = (user) => {
  if (isAlreadyBooked(user)) return
  const idx = selectedMembersToAdd.value.indexOf(user.lineUserId)
  if (idx === -1) {
    selectedMembersToAdd.value.push(user.lineUserId)
  } else {
    selectedMembersToAdd.value.splice(idx, 1)
  }
}

const confirmAddMembers = async () => {
  if (!addMemberTargetClass.value || selectedMembersToAdd.value.length === 0) return
  addingMember.value = true
  const yogaClass = addMemberTargetClass.value
  try {
    for (const lineUserId of selectedMembersToAdd.value) {
      const user = users.value.find(u => u.lineUserId === lineUserId)
      if (!user) continue
      await addDoc(collection(db, 'bookings'), {
        userId: lineUserId,
        classId: yogaClass.id,
        className: yogaClass.name,
        date: yogaClass.date,
        time: yogaClass.time,
        instructor: yogaClass.instructor,
        status: 'confirmed',
        bookedAt: new Date(),
        canCancelUntil: new Date(`${yogaClass.date}T${yogaClass.time}:00`)
      })
      await updateDoc(doc(db, 'classes', yogaClass.id), {
        currentBookings: increment(1)
      })
    }
    showAddMemberModal.value = false
    await loadAllData(true)
    Swal.fire({
      title: 'สำเร็จ!',
      text: `เพิ่มสมาชิก ${selectedMembersToAdd.value.length} คน เข้าคลาสสำเร็จ!`,
      icon: 'success',
      confirmButtonText: 'ตกลง'
    })
  } catch (error) {
    console.error('Error adding members:', error)
    Swal.fire({ title: 'เกิดข้อผิดพลาด!', text: 'ไม่สามารถเพิ่มสมาชิกได้', icon: 'error', confirmButtonText: 'ตกลง' })
  } finally {
    addingMember.value = false
  }
}

onMounted(async () => {
  // โหลดข้อมูลทั้งหมดครั้งเดียว
  loadingClasses.value = true
  loadingUsers.value = true
  loadingBookings.value = true
  
  await loadAllData()
  
  loadingClasses.value = false
  loadingUsers.value = false
  loadingBookings.value = false
})
</script>