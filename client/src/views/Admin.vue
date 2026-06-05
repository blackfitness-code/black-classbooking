<template>
  <div class="min-h-screen bg-gray-50 pb-24">
    <!-- Sticky Header -->
    <header class="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      <div class="max-w-2xl mx-auto px-4 pt-3 pb-0">
        <div class="flex items-center gap-2 mb-3">
          <button @click="$router.go(-1)" class="p-2 rounded-xl hover:bg-gray-100 transition-colors -ml-2">
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 class="text-lg font-bold text-gray-900 flex-1">Admin Panel</h1>
          <button @click="refreshData" :disabled="isLoading"
            class="p-2 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-40">
            <svg :class="['w-5 h-5 text-gray-500', isLoading && 'animate-spin']"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </button>
        </div>

        <!-- Tab Navigation -->
        <nav class="flex overflow-x-auto scrollbar-hide -mx-4 px-4">
          <button v-for="tab in tabs" :key="tab.value" @click="activeSection = tab.value"
            :class="['flex items-center gap-1.5 py-2.5 px-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap shrink-0',
              activeSection === tab.value
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-400 hover:text-gray-600']">
            <span class="text-sm">{{ tab.icon }}</span>
            {{ tab.label }}
          </button>
        </nav>
      </div>
    </header>

    <main class="max-w-2xl mx-auto px-4 py-5 space-y-4">

      <!-- ===== DASHBOARD ===== -->
      <template v-if="activeSection === 'dashboard'">
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p class="text-3xl font-bold text-gray-900">{{ classes.length }}</p>
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-1">คลาสทั้งหมด</p>
            <p class="text-xs text-emerald-600 mt-1.5">{{ upcomingClassesCount }} กำลังจะมา</p>
          </div>
          <div class="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p class="text-3xl font-bold text-gray-900">{{ users.length }}</p>
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-1">สมาชิกทั้งหมด</p>
            <p class="text-xs text-emerald-600 mt-1.5">{{ activeMembers }} ใช้งานได้</p>
          </div>
          <div class="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p class="text-3xl font-bold text-emerald-600">{{ bookingStats.confirmed }}</p>
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-1">การจองที่ยืนยัน</p>
          </div>
          <div class="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p class="text-3xl font-bold text-blue-600">{{ todayBookingsCount }}</p>
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-1">การจองวันนี้</p>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">ทำรายการด่วน</p>
          <div class="grid grid-cols-2 gap-2">
            <button @click="activeSection = 'classes'; showAddClassModal = true"
              class="flex items-center gap-2 p-3 bg-primary/10 text-primary rounded-xl text-sm font-semibold hover:bg-primary/20 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              เพิ่มคลาส
            </button>
            <button @click="activeSection = 'users'"
              class="flex items-center gap-2 p-3 bg-blue-50 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              จัดการสมาชิก
            </button>
            <button @click="exportBookingsToCSV"
              class="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-semibold hover:bg-emerald-100 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Export CSV
            </button>
            <button @click="activeSection = 'classTypes'"
              class="flex items-center gap-2 p-3 bg-violet-50 text-violet-600 rounded-xl text-sm font-semibold hover:bg-violet-100 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
              </svg>
              ประเภทคลาส
            </button>
          </div>
        </div>

        <!-- Today's Classes -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <p class="font-semibold text-gray-900">คลาสวันนี้</p>
            <button @click="activeSection = 'classes'" class="text-xs text-primary font-semibold">ดูทั้งหมด →</button>
          </div>
          <div v-if="todayClasses.length === 0" class="px-4 py-8 text-center text-sm text-gray-400">ไม่มีคลาสวันนี้</div>
          <div v-else class="divide-y divide-gray-50">
            <div v-for="cls in todayClasses" :key="cls.id" class="px-4 py-3 flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                <svg class="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path :d="getClassTypeInfoLocal(cls.type).iconPath"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-gray-900 truncate">{{ cls.name }}</p>
                <p class="text-xs text-gray-400">{{ cls.time }} · {{ cls.instructor }}</p>
              </div>
              <div class="text-right shrink-0">
                <p class="text-sm font-bold text-gray-900">{{ cls.currentBookings }}<span class="text-gray-300 font-normal">/{{ cls.maxCapacity }}</span></p>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- ===== CLASSES ===== -->
      <template v-if="activeSection === 'classes'">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-bold text-gray-900">จัดการคลาส</h2>
            <p class="text-xs text-gray-400">{{ filteredClasses.length }} คลาส</p>
          </div>
          <button @click="showAddClassModal = true"
            class="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            เพิ่มคลาส
          </button>
        </div>

        <!-- Date Filter -->
        <div class="flex items-center gap-2">
          <input v-model="classDateFilter" type="date"
            class="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white">
          <button v-if="classDateFilter" @click="classDateFilter = ''"
            class="px-3 py-2 text-sm bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors whitespace-nowrap">
            ล้าง
          </button>
        </div>

        <!-- Class Cards -->
        <div v-if="!isLoading" class="space-y-3">
          <div v-for="yogaClass in paginatedClasses" :key="yogaClass.id"
            class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div class="p-4">
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                  <svg class="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path :d="getClassTypeInfoLocal(yogaClass.type).iconPath"/>
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <h4 class="font-bold text-gray-900">{{ yogaClass.name }}</h4>
                    <span :class="['text-xs px-2 py-0.5 rounded-full font-medium border', getClassTypeColor(yogaClass.type)]">
                      {{ getClassTypeInfoLocal(yogaClass.type).label }}
                    </span>
                    <span :class="['text-xs px-2 py-0.5 rounded-full font-medium',
                      getClassStatus(yogaClass) === 'upcoming' ? 'bg-emerald-100 text-emerald-700' :
                      getClassStatus(yogaClass) === 'ongoing' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-500']">
                      {{ getClassStatusText(yogaClass) }}
                    </span>
                  </div>
                  <div class="flex flex-wrap gap-x-3 mt-1.5 text-sm text-gray-500">
                    <span>{{ formatDate(yogaClass.date) }}</span>
                    <span>{{ yogaClass.time }}</span>
                    <span>{{ yogaClass.instructor }}</span>
                    <span class="font-semibold text-gray-700">{{ yogaClass.currentBookings }}/{{ yogaClass.maxCapacity }}</span>
                  </div>
                  <p v-if="yogaClass.description" class="text-xs text-gray-400 mt-1.5 line-clamp-2">{{ yogaClass.description }}</p>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex items-center justify-end gap-0.5 mt-3 pt-3 border-t border-gray-50">
                <button @click="$router.push(`/class/${yogaClass.id}`)"
                  class="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-colors" title="ดูรายละเอียด">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                </button>
                <button @click="openAddMemberModal(yogaClass)"
                  class="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors" title="เพิ่มสมาชิก">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                  </svg>
                </button>
                <button @click="editClass(yogaClass)"
                  class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors" title="แก้ไข">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
                <button @click="deleteClass(yogaClass)"
                  class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors" title="ลบ">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Bookings List -->
            <div v-if="getClassBookings(yogaClass.id).length > 0" class="border-t border-gray-100">
              <div class="px-4 py-2 bg-gray-50/80">
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  ผู้จอง ({{ getClassBookings(yogaClass.id).length }})
                </p>
              </div>
              <div class="divide-y divide-gray-50">
                <div v-for="booking in getClassBookings(yogaClass.id)" :key="booking.id"
                  class="px-4 py-2.5 flex items-center gap-3">
                  <img :src="getUserProfile(booking.userId)?.pictureUrl || '/default-avatar.png'"
                    class="w-8 h-8 rounded-full object-cover shrink-0 border border-gray-100">
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">
                      {{ getUserProfile(booking.userId)?.nickname || getUserProfile(booking.userId)?.displayName || 'ไม่มีชื่อ' }}
                    </p>
                    <p v-if="getUserProfile(booking.userId)?.firstName || getUserProfile(booking.userId)?.lastName"
                      class="text-xs text-gray-400 truncate">
                      {{ getUserProfile(booking.userId)?.firstName }} {{ getUserProfile(booking.userId)?.lastName }}
                    </p>
                  </div>
                  <span class="text-xs text-gray-400 shrink-0">{{ formatTime(booking.bookedAt) }}</span>
                  <button @click="removeMemberFromClass(booking, yogaClass)"
                    class="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                    title="ลบออกจากคลาส">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div v-else class="border-t border-gray-100 px-4 py-3 text-center text-xs text-gray-300">
              ยังไม่มีผู้จอง
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalClassPages > 1" class="flex items-center justify-between">
          <p class="text-xs text-gray-400">
            {{ ((currentClassPage - 1) * classItemsPerPage) + 1 }}–{{ Math.min(currentClassPage * classItemsPerPage, filteredClasses.length) }}
            จาก {{ filteredClasses.length }}
          </p>
          <div class="flex items-center gap-1">
            <button @click="currentClassPage = Math.max(1, currentClassPage - 1)" :disabled="currentClassPage === 1"
              class="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 bg-white">ก่อนหน้า</button>
            <button v-for="page in getVisibleClassPages()" :key="page" @click="currentClassPage = page"
              :class="['px-3 py-1.5 text-xs border rounded-lg',
                currentClassPage === page ? 'bg-primary text-white border-primary' : 'border-gray-200 hover:bg-gray-50 bg-white']">
              {{ page }}
            </button>
            <button @click="currentClassPage = Math.min(totalClassPages, currentClassPage + 1)" :disabled="currentClassPage === totalClassPages"
              class="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 bg-white">ถัดไป</button>
          </div>
        </div>
      </template>

      <!-- ===== USERS ===== -->
      <template v-if="activeSection === 'users'">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-bold text-gray-900">จัดการสมาชิก</h2>
            <p class="text-xs text-gray-400">{{ filteredUsers.length }} คน</p>
          </div>
        </div>

        <div class="space-y-2.5">
          <div class="relative">
            <input v-model="userSearch" type="text" placeholder="ค้นหาสมาชิก..."
              class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white">
            <svg class="absolute left-3.5 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <div class="flex gap-2">
            <select v-model="userSortBy" class="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="createdAt">เรียงตามวันที่สมัคร</option>
              <option value="name">เรียงตามชื่อ</option>
              <option value="membership">เรียงตามสมาชิก</option>
              <option value="role">เรียงตาม Role</option>
            </select>
            <select v-model="membershipFilter" class="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="all">ทั้งหมด</option>
              <option value="active">ใช้งานได้</option>
              <option value="expired">หมดอายุ</option>
              <option value="none">ไม่มีสมาชิก</option>
            </select>
          </div>
        </div>

        <div v-if="!isLoading" class="space-y-3">
          <div v-for="user in filteredUsers" :key="user.id"
            class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div class="p-4">
              <div class="flex items-start gap-3">
                <img :src="user.pictureUrl || '/default-avatar.png'"
                  class="w-10 h-10 rounded-full object-cover shrink-0 border border-gray-100">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <h4 class="font-bold text-gray-900 truncate">{{ user.nickname || user.displayName || 'ไม่มีชื่อ' }}</h4>
                    <span :class="['text-xs px-2 py-0.5 rounded-full font-medium',
                      user.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-500']">
                      {{ user.role === 'admin' ? 'Admin' : 'User' }}
                    </span>
                    <span :class="['text-xs px-2 py-0.5 rounded-full font-medium',
                      isMembershipValid(user) ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-500']">
                      {{ isMembershipValid(user) ? 'ใช้งานได้' : 'หมดอายุ' }}
                    </span>
                  </div>
                  <p v-if="user.firstName || user.lastName" class="text-xs text-gray-500 mt-0.5">
                    {{ user.firstName }} {{ user.lastName }}
                  </p>
                  <p class="text-xs text-gray-400 mt-0.5">สมาชิกถึง: {{ getMembershipExpiryDisplay(user) }}</p>
                </div>
              </div>
            </div>

            <div class="border-t border-gray-100 p-4 space-y-3">
              <div>
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5 block">จัดการ Role</label>
                <select :value="user.role || 'user'" @change="updateUserRole(user, $event.target.value)"
                  class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="user">User (ผู้ใช้ทั่วไป)</option>
                  <option value="admin">Admin (ผู้ดูแลระบบ)</option>
                </select>
              </div>
              <div>
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5 block">วันหมดอายุสมาชิก</label>
                <div class="flex gap-2">
                  <input :value="getMembershipExpiryForInput(user)" @change="updateMembershipExpiry(user, $event.target.value)"
                    type="date"
                    class="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary">
                  <button @click="setMembershipExpiry(user)"
                    class="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
                    บันทึก
                  </button>
                </div>
              </div>

              <!-- Cooldown Section -->
              <div class="pt-1">
                <div class="flex items-center justify-between mb-1.5">
                  <label class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Cooldown (ระงับการจอง)</label>
                  <div class="flex items-center gap-1.5">
                    <span v-if="isUserInCooldown(user)"
                      class="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">
                      🚫 เหลืออีก {{ getCooldownDaysLeft(user) }} วัน
                    </span>
                    <span v-else class="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">ไม่มี</span>
                  </div>
                </div>

                <!-- Active cooldown info -->
                <div v-if="isUserInCooldown(user)"
                  class="bg-red-50 border border-red-100 rounded-xl p-3 mb-2 text-xs text-red-700 space-y-0.5">
                  <p>ถูกระงับถึง: <strong>{{ getCooldownEndDateDisplay(user) }}</strong></p>
                  <p v-if="user.cooldownReason" class="text-red-500">เหตุผล: {{ user.cooldownReason }}</p>
                </div>

                <div class="flex gap-2">
                  <button @click="openCooldownModal(user)"
                    class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-orange-50 text-orange-600 border border-orange-200 rounded-xl text-sm font-semibold hover:bg-orange-100 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    {{ isUserInCooldown(user) ? 'แก้ไข Cooldown' : 'ตั้ง Cooldown' }}
                  </button>
                  <button v-if="isUserInCooldown(user)" @click="clearCooldown(user)"
                    class="px-3 py-2 bg-white border border-gray-200 text-gray-500 rounded-xl text-sm font-semibold hover:bg-gray-50 hover:text-red-500 hover:border-red-200 transition-colors">
                    ยกเลิก
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- ===== BOOKINGS ===== -->
      <template v-if="activeSection === 'bookings'">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-bold text-gray-900">ประวัติการจอง</h2>
            <p class="text-xs text-gray-400">{{ filteredBookings.length }} รายการ</p>
          </div>
          <button @click="exportBookingsToCSV" :disabled="filteredBookings.length === 0"
            class="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-40">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Export
          </button>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-4 gap-2">
          <div class="bg-white rounded-2xl p-3 text-center border border-gray-100 shadow-sm">
            <p class="text-xl font-bold text-gray-900">{{ bookingStats.total }}</p>
            <p class="text-xs text-gray-400 mt-0.5">ทั้งหมด</p>
          </div>
          <div class="bg-white rounded-2xl p-3 text-center border border-gray-100 shadow-sm">
            <p class="text-xl font-bold text-emerald-600">{{ bookingStats.confirmed }}</p>
            <p class="text-xs text-gray-400 mt-0.5">ยืนยัน</p>
          </div>
          <div class="bg-white rounded-2xl p-3 text-center border border-gray-100 shadow-sm">
            <p class="text-xl font-bold text-blue-600">{{ bookingStats.completed }}</p>
            <p class="text-xs text-gray-400 mt-0.5">เสร็จ</p>
          </div>
          <div class="bg-white rounded-2xl p-3 text-center border border-gray-100 shadow-sm">
            <p class="text-xl font-bold text-red-500">{{ bookingStats.cancelled }}</p>
            <p class="text-xs text-gray-400 mt-0.5">ยกเลิก</p>
          </div>
        </div>

        <!-- Search & Filters -->
        <div class="space-y-2.5">
          <div class="relative">
            <input v-model="bookingSearch" type="text" placeholder="ค้นหาชื่อ, คลาส, ครู..."
              class="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white">
            <svg class="absolute left-3.5 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <button v-if="bookingSearch" @click="bookingSearch = ''"
              class="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="flex gap-2 overflow-x-auto pb-0.5">
            <select v-model="bookingSortBy" class="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none shrink-0">
              <option value="date-desc">ใหม่ → เก่า</option>
              <option value="date-asc">เก่า → ใหม่</option>
              <option value="user-name">ชื่อผู้จอง</option>
              <option value="class-name">ชื่อคลาส</option>
              <option value="status">สถานะ</option>
            </select>
            <select v-model="bookingStatusFilter" class="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none shrink-0">
              <option value="all">ทุกสถานะ</option>
              <option value="confirmed">ยืนยันแล้ว</option>
              <option value="completed">เสร็จสิ้น</option>
              <option value="cancelled">ยกเลิกแล้ว</option>
            </select>
            <select v-model="bookingDateFilter" class="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none shrink-0">
              <option value="all">ทุกช่วงเวลา</option>
              <option value="today">วันนี้</option>
              <option value="this-week">สัปดาห์นี้</option>
              <option value="this-month">เดือนนี้</option>
              <option value="upcoming">กำลังจะมา</option>
              <option value="past">ผ่านมาแล้ว</option>
            </select>
          </div>
          <div class="flex gap-2 flex-wrap">
            <button @click="bookingDateFilter = 'today'"
              :class="['px-3 py-1 rounded-full text-xs font-semibold transition-all',
                bookingDateFilter === 'today' ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50']">
              วันนี้ ({{ getTodayBookingsCount() }})
            </button>
            <button @click="bookingDateFilter = 'upcoming'"
              :class="['px-3 py-1 rounded-full text-xs font-semibold transition-all',
                bookingDateFilter === 'upcoming' ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50']">
              กำลังจะมา ({{ getUpcomingBookingsCount() }})
            </button>
            <button v-if="hasActiveFilters" @click="clearAllFilters"
              class="px-3 py-1 rounded-full text-xs font-semibold bg-white border border-red-200 text-red-500 hover:bg-red-50 transition-all">
              ล้างตัวกรอง
            </button>
          </div>
        </div>

        <!-- Booking Groups -->
        <div v-if="!isLoading" class="space-y-3">
          <div v-for="userGroup in groupedBookings" :key="userGroup.userId"
            class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div class="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
              <img :src="userGroup.user?.pictureUrl || '/default-avatar.png'"
                class="w-9 h-9 rounded-full object-cover shrink-0 border border-gray-100">
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-gray-900 truncate"
                  v-html="highlightSearchTerm(userGroup.user?.nickname || userGroup.user?.displayName || 'ไม่มีชื่อ')"></p>
                <p v-if="userGroup.user?.firstName || userGroup.user?.lastName"
                  class="text-xs text-gray-400 truncate"
                  v-html="highlightSearchTerm(`${userGroup.user?.firstName || ''} ${userGroup.user?.lastName || ''}`.trim())"></p>
              </div>
              <span class="text-xs text-gray-400 shrink-0">{{ userGroup.bookings.length }} รายการ</span>
            </div>
            <div class="divide-y divide-gray-50">
              <div v-for="booking in userGroup.bookings" :key="booking.id" class="px-4 py-2.5 flex items-center gap-3">
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate" v-html="highlightSearchTerm(booking.className)"></p>
                  <p class="text-xs text-gray-400">
                    <span v-html="highlightSearchTerm(formatDate(booking.date))"></span>
                    · <span v-html="highlightSearchTerm(booking.time)"></span>
                    · <span v-html="highlightSearchTerm(booking.instructor)"></span>
                  </p>
                </div>
                <span :class="['text-xs px-2 py-0.5 rounded-full font-medium shrink-0', getStatusColor(booking.status)]">
                  {{ getStatusText(booking.status) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-between">
          <p class="text-xs text-gray-400">
            {{ ((currentPage - 1) * itemsPerPage) + 1 }}–{{ Math.min(currentPage * itemsPerPage, filteredBookings.length) }}
            จาก {{ filteredBookings.length }}
          </p>
          <div class="flex items-center gap-1">
            <button @click="currentPage = Math.max(1, currentPage - 1)" :disabled="currentPage === 1"
              class="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 bg-white">ก่อนหน้า</button>
            <button v-for="page in getVisiblePages()" :key="page" @click="currentPage = page"
              :class="['px-3 py-1.5 text-xs border rounded-lg',
                currentPage === page ? 'bg-primary text-white border-primary' : 'border-gray-200 hover:bg-gray-50 bg-white']">
              {{ page }}
            </button>
            <button @click="currentPage = Math.min(totalPages, currentPage + 1)" :disabled="currentPage === totalPages"
              class="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 bg-white">ถัดไป</button>
          </div>
        </div>
      </template>

      <!-- ===== CLASS TYPES ===== -->
      <template v-if="activeSection === 'classTypes'">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-bold text-gray-900">ประเภทคลาส</h2>
            <p class="text-xs text-gray-400">จัดการประเภทและคลาสย่อย</p>
          </div>
          <button @click="showAddTypeModal = true"
            class="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            เพิ่มประเภท
          </button>
        </div>

        <div class="space-y-3">
          <div v-for="type in allClassTypes" :key="type.value"
            class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <!-- Type Header -->
            <div class="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                <svg class="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path :d="getClassTypeInfoLocal(type.value).iconPath"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-bold text-gray-900">{{ type.label }}</p>
                <p class="text-xs text-gray-400">{{ getAllSubtypes(type.value).length }} คลาสย่อย</p>
              </div>
              <div class="flex items-center gap-1 shrink-0">
                <span v-if="type.isBuiltIn" class="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">Built-in</span>
                <button v-else @click="deleteClassType(type)"
                  class="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
                <button @click="openAddSubtypeModal(type)"
                  class="p-1.5 text-gray-300 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="เพิ่มคลาสย่อย">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Subtypes -->
            <div v-if="getAllSubtypes(type.value).length > 0" class="divide-y divide-gray-50">
              <div v-for="subtype in getAllSubtypes(type.value)" :key="subtype.value"
                class="px-4 py-3 flex items-start gap-3">
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-gray-800">{{ subtype.label }}</p>
                  <p class="text-xs text-gray-400 mt-0.5 line-clamp-2">{{ subtype.description }}</p>
                </div>
                <div class="shrink-0 flex items-center">
                  <span v-if="subtype.isBuiltIn" class="text-xs text-gray-300 px-1">Built-in</span>
                  <button v-else @click="deleteSubtype(type.value, subtype)"
                    class="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div v-else class="px-4 py-4 text-center text-xs text-gray-300">ยังไม่มีคลาสย่อย กดปุ่ม + เพื่อเพิ่ม</div>
          </div>
        </div>
      </template>

    </main>

    <!-- ===== MODALS ===== -->

    <!-- Edit Class Modal -->
    <div v-if="showEditClassModal" class="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-4">
      <div class="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-sm max-h-[90dvh] overflow-y-auto">
        <div class="p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-bold text-gray-900">แก้ไขคลาส</h3>
            <button @click="showEditClassModal = false" class="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <form @submit.prevent="updateClass" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">ประเภทคลาส</label>
              <select v-model="editingClass.type" required
                class="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-white">
                <option v-for="ct in allClassTypes" :key="ct.value" :value="ct.value">{{ ct.label }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">คลาส</label>
              <select v-model="editingClass.subtype" required
                class="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-white">
                <option value="" disabled>เลือกคลาส</option>
                <option v-for="st in editAvailableSubtypes" :key="st.value" :value="st.value">{{ st.label }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">วันที่</label>
              <input v-model="editingClass.date" type="date" required
                class="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">เวลา</label>
              <input v-model="editingClass.time" type="time" required
                class="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">ครูผู้สอน</label>
              <input v-model="editingClass.instructor" type="text" required
                class="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">จำนวนคนสูงสุด</label>
              <input v-model.number="editingClass.maxCapacity" type="number" min="1" required
                class="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm">
            </div>
            <div class="flex gap-3 pt-1">
              <button type="button" @click="showEditClassModal = false"
                class="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">ยกเลิก</button>
              <button type="submit" :disabled="addingClass"
                class="flex-1 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
                {{ addingClass ? 'กำลังบันทึก...' : 'บันทึก' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Add Class Modal -->
    <div v-if="showAddClassModal" class="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-4">
      <div class="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-sm max-h-[90dvh] overflow-y-auto">
        <div class="p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-bold text-gray-900">เพิ่มคลาสใหม่</h3>
            <button @click="showAddClassModal = false" class="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <form @submit.prevent="addClass" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">ประเภทคลาส</label>
              <select v-model="newClass.type" required
                class="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-white">
                <option v-for="ct in allClassTypes" :key="ct.value" :value="ct.value">{{ ct.label }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">คลาส</label>
              <select v-model="newClass.subtype" required
                class="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-white">
                <option value="" disabled>เลือกคลาส</option>
                <option v-for="st in availableSubtypes" :key="st.value" :value="st.value">{{ st.label }}</option>
              </select>
              <p class="text-xs text-gray-400 mt-1">ชื่อและรายละเอียดจะกำหนดอัตโนมัติ</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">วันที่</label>
              <input v-model="newClass.date" type="date" required
                class="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">เวลา</label>
              <input v-model="newClass.time" type="time" required
                class="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">ครูผู้สอน</label>
              <input v-model="newClass.instructor" type="text" required
                class="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">จำนวนคนสูงสุด</label>
              <input v-model.number="newClass.maxCapacity" type="number" min="1" required
                class="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm">
            </div>
            <div class="flex gap-3 pt-1">
              <button type="button" @click="showAddClassModal = false"
                class="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">ยกเลิก</button>
              <button type="submit" :disabled="addingClass"
                class="flex-1 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
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
        <div class="p-4 border-b border-gray-100">
          <h3 class="text-base font-bold text-gray-900">เพิ่มสมาชิกเข้าคลาส</h3>
          <p class="text-xs text-gray-400 mt-0.5">{{ addMemberTargetClass?.name }} · {{ addMemberTargetClass ? formatDate(addMemberTargetClass.date) : '' }} {{ addMemberTargetClass?.time }}</p>
          <div class="relative mt-3">
            <input v-model="addMemberSearch" type="text" placeholder="ค้นหาสมาชิก..."
              class="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            <svg class="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
        </div>
        <div class="overflow-y-auto flex-1 p-3 space-y-1.5">
          <div v-for="user in filteredAddMemberUsers" :key="user.id"
            @click="toggleMemberSelection(user)"
            :class="['flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all',
              isAlreadyBooked(user) ? 'opacity-50 cursor-not-allowed' :
              selectedMembersToAdd.includes(user.lineUserId)
                ? 'bg-primary/10 border-2 border-primary'
                : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100']">
            <img :src="user.pictureUrl || '/default-avatar.png'" class="w-10 h-10 rounded-full object-cover shrink-0">
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-sm truncate">{{ user.nickname || user.displayName || 'ไม่มีชื่อ' }}</p>
              <p v-if="user.firstName || user.lastName" class="text-xs text-gray-400 truncate">{{ user.firstName }} {{ user.lastName }}</p>
            </div>
            <div v-if="isAlreadyBooked(user)" class="text-xs text-gray-400 shrink-0">จองแล้ว</div>
            <svg v-else-if="selectedMembersToAdd.includes(user.lineUserId)" class="w-5 h-5 text-primary shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          </div>
          <p v-if="filteredAddMemberUsers.length === 0" class="text-center text-sm text-gray-400 py-6">ไม่พบสมาชิก</p>
        </div>
        <div class="p-4 border-t border-gray-100 flex gap-3">
          <button @click="showAddMemberModal = false"
            class="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">ยกเลิก</button>
          <button @click="confirmAddMembers" :disabled="selectedMembersToAdd.length === 0 || addingMember"
            class="flex-1 py-3 bg-primary text-white rounded-xl text-sm font-semibold disabled:opacity-50 hover:bg-primary/90 transition-colors">
            {{ addingMember ? 'กำลังเพิ่ม...' : `เพิ่ม (${selectedMembersToAdd.length})` }}
          </button>
        </div>
      </div>
    </div>

    <!-- Add Class Type Modal -->
    <div v-if="showAddTypeModal" class="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
      <div class="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-sm">
        <div class="p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-bold text-gray-900">เพิ่มประเภทคลาสใหม่</h3>
            <button @click="showAddTypeModal = false" class="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <form @submit.prevent="addClassType" class="space-y-4">
            <div>
              <label class="text-sm font-medium text-gray-700 mb-1.5 block">ชื่อประเภทคลาส</label>
              <input v-model="newClassType.label" type="text" required placeholder="เช่น Martial Arts, Pilates"
                class="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm">
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 mb-1.5 block">รหัส (ภาษาอังกฤษ)</label>
              <input v-model="newClassType.value" type="text" required placeholder="เช่น martial-arts"
                class="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm">
              <p class="text-xs text-gray-400 mt-1">ตัวพิมพ์เล็ก ตัวเลข และขีด - เท่านั้น ห้ามซ้ำกับที่มีอยู่</p>
            </div>
            <div class="flex gap-3 pt-1">
              <button type="button" @click="showAddTypeModal = false"
                class="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">ยกเลิก</button>
              <button type="submit" :disabled="addingType"
                class="flex-1 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
                {{ addingType ? 'กำลังเพิ่ม...' : 'เพิ่มประเภท' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Add Subtype Modal -->
    <div v-if="showAddSubtypeModal" class="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
      <div class="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-sm max-h-[90dvh] overflow-y-auto">
        <div class="p-5">
          <div class="flex items-center justify-between mb-1">
            <h3 class="text-base font-bold text-gray-900">เพิ่มคลาสย่อย</h3>
            <button @click="showAddSubtypeModal = false" class="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <p class="text-xs text-gray-400 mb-4">เพิ่มใน: {{ addSubtypeTargetType?.label }}</p>
          <form @submit.prevent="addSubtype" class="space-y-4">
            <div>
              <label class="text-sm font-medium text-gray-700 mb-1.5 block">ชื่อคลาส</label>
              <input v-model="newSubtype.label" type="text" required placeholder="เช่น Beginner Yoga"
                class="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm">
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 mb-1.5 block">รหัสคลาส</label>
              <input v-model="newSubtype.value" type="text" required placeholder="เช่น beginner-yoga"
                class="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm">
              <p class="text-xs text-gray-400 mt-1">ตัวพิมพ์เล็ก ตัวเลข และขีด - เท่านั้น</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 mb-1.5 block">คำอธิบาย</label>
              <textarea v-model="newSubtype.description" rows="3" placeholder="อธิบายเกี่ยวกับคลาสนี้..."
                class="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"></textarea>
            </div>
            <div class="flex gap-3 pt-1">
              <button type="button" @click="showAddSubtypeModal = false"
                class="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">ยกเลิก</button>
              <button type="submit" :disabled="addingSubtype"
                class="flex-1 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
                {{ addingSubtype ? 'กำลังเพิ่ม...' : 'เพิ่มคลาสย่อย' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Cooldown Modal -->
    <div v-if="showCooldownModal" class="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
      <div class="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-sm">
        <div class="p-5">
          <div class="flex items-center justify-between mb-1">
            <h3 class="text-base font-bold text-gray-900">ตั้ง Cooldown</h3>
            <button @click="showCooldownModal = false" class="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <p class="text-xs text-gray-400 mb-4">
            {{ cooldownTargetUser?.nickname || cooldownTargetUser?.displayName || 'สมาชิก' }}
            จะไม่สามารถจองคลาสได้ในช่วงเวลาที่กำหนด
          </p>

          <div class="space-y-4">
            <!-- Preset Buttons -->
            <div>
              <label class="text-sm font-medium text-gray-700 mb-2 block">เลือกระยะเวลา Cooldown</label>
              <div class="grid grid-cols-4 gap-2">
                <button v-for="d in [3, 7, 14, 30]" :key="d"
                  @click="cooldownDays = d"
                  :class="['py-2 rounded-xl text-sm font-semibold transition-all border',
                    cooldownDays === d
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-500']">
                  {{ d }} วัน
                </button>
              </div>
            </div>

            <!-- Custom Days -->
            <div>
              <label class="text-sm font-medium text-gray-700 mb-1.5 block">หรือกำหนดเอง (วัน)</label>
              <input v-model.number="cooldownDays" type="number" min="1" max="365"
                class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="จำนวนวัน">
              <p v-if="cooldownDays > 0" class="text-xs text-gray-400 mt-1">
                ระงับถึง: <strong>{{ getCooldownPreviewDate(cooldownDays) }}</strong>
              </p>
            </div>

            <!-- Reason -->
            <div>
              <label class="text-sm font-medium text-gray-700 mb-1.5 block">เหตุผล (ไม่บังคับ)</label>
              <textarea v-model="cooldownReason" rows="2"
                placeholder="เช่น ไม่มาเรียนโดยไม่แจ้ง, ยกเลิกกระชั้นชิด..."
                class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none">
              </textarea>
            </div>

            <div class="flex gap-3 pt-1">
              <button @click="showCooldownModal = false"
                class="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
                ยกเลิก
              </button>
              <button @click="setCooldown" :disabled="settingCooldown || cooldownDays < 1"
                class="flex-1 py-3 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50">
                {{ settingCooldown ? 'กำลังบันทึก...' : `ตั้ง Cooldown ${cooldownDays} วัน` }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <LoadingOverlay :show="isLoading" title="กำลังโหลดข้อมูล" subtitle="กรุณารอสักครู่..."/>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import { db } from '../firebase'
import {
  collection, getDocs, addDoc, deleteDoc, doc, updateDoc,
  Timestamp, increment, getDoc, setDoc
} from 'firebase/firestore'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import Swal from 'sweetalert2'
import LoadingOverlay from '../components/LoadingOverlay.vue'
import { CLASS_TYPES, CLASS_SUBTYPES, getClassTypeInfo, getClassTypeColor, getClassSubtypes, getClassSubtypeInfo } from '../constants/classTypes'
import { getCachedData, setCachedData, clearCache, CACHE_KEYS } from '../utils/cache'

const authStore = useAuthStore()

const DEFAULT_ICON_PATH = 'M12 2C10.9 2 10 2.9 10 4s.9 2 2 2 2-.9 2-2-.9-2-2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z'

const tabs = [
  { value: 'dashboard', label: 'ภาพรวม', icon: '📊' },
  { value: 'classes', label: 'คลาส', icon: '📅' },
  { value: 'users', label: 'สมาชิก', icon: '👥' },
  { value: 'bookings', label: 'การจอง', icon: '📋' },
  { value: 'classTypes', label: 'ประเภทคลาส', icon: '🏷️' },
]

const activeSection = ref('dashboard')
const classes = ref([])
const users = ref([])
const allBookings = ref([])
const classBookings = ref([])
const isLoading = ref(false)

// Class date filter
const classDateFilter = ref('')

// User filters
const userSearch = ref('')
const userSortBy = ref('createdAt')
const membershipFilter = ref('all')

// Booking filters
const bookingSearch = ref('')
const bookingSortBy = ref('date-desc')
const bookingStatusFilter = ref('all')
const bookingDateFilter = ref('all')

// Pagination - bookings
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Pagination - classes
const currentClassPage = ref(1)
const classItemsPerPage = ref(10)

// Class modal state
const showEditClassModal = ref(false)
const editingClass = ref(null)
const showAddClassModal = ref(false)
const addingClass = ref(false)
const newClass = ref({ type: 'yoga', subtype: '', date: '', time: '', instructor: '', maxCapacity: 10 })

// Add member state
const showAddMemberModal = ref(false)
const addMemberTargetClass = ref(null)
const addMemberSearch = ref('')
const selectedMembersToAdd = ref([])
const addingMember = ref(false)

// Stored membership date selections
const selectedDates = ref({})

// Custom class types state
const customClassSettings = ref({ customTypes: [], customSubtypes: {} })

// Add class type modal
const showAddTypeModal = ref(false)
const addingType = ref(false)
const newClassType = ref({ value: '', label: '' })

// Add subtype modal
const showAddSubtypeModal = ref(false)
const addingSubtype = ref(false)
const addSubtypeTargetType = ref(null)
const newSubtype = ref({ value: '', label: '', description: '' })

// ---- Computed ----

const allClassTypes = computed(() => {
  const builtIn = CLASS_TYPES.map(t => ({ ...t, isBuiltIn: true }))
  const custom = (customClassSettings.value.customTypes || []).map(t => ({ ...t, isBuiltIn: false }))
  return [...builtIn, ...custom]
})

const getAllSubtypes = (typeValue) => {
  const builtIn = (CLASS_SUBTYPES[typeValue] || []).map(s => ({ ...s, isBuiltIn: true }))
  const custom = ((customClassSettings.value.customSubtypes || {})[typeValue] || []).map(s => ({ ...s, isBuiltIn: false }))
  return [...builtIn, ...custom]
}

const getClassTypeInfoLocal = (typeValue) => {
  const found = CLASS_TYPES.find(t => t.value === typeValue)
  if (found) return found
  const custom = (customClassSettings.value.customTypes || []).find(t => t.value === typeValue)
  if (custom) return { ...custom, iconPath: DEFAULT_ICON_PATH, color: 'black' }
  return { label: typeValue, iconPath: DEFAULT_ICON_PATH, color: 'black' }
}

const getSubtypeInfoLocal = (typeValue, subtypeValue) => {
  const builtIn = getClassSubtypeInfo(typeValue, subtypeValue)
  if (builtIn) return builtIn
  const customSubs = (customClassSettings.value.customSubtypes || {})[typeValue] || []
  return customSubs.find(s => s.value === subtypeValue) || null
}

const availableSubtypes = computed(() => getAllSubtypes(newClass.value.type))
const editAvailableSubtypes = computed(() => editingClass.value ? getAllSubtypes(editingClass.value.type) : [])

const filteredClasses = computed(() => {
  if (!classDateFilter.value) return classes.value
  return classes.value.filter(c => c.date === classDateFilter.value)
})

const paginatedClasses = computed(() => {
  const start = (currentClassPage.value - 1) * classItemsPerPage.value
  return filteredClasses.value.slice(start, start + classItemsPerPage.value)
})

const totalClassPages = computed(() => Math.ceil(filteredClasses.value.length / classItemsPerPage.value))

const filteredUsers = computed(() => {
  let filtered = users.value
  if (userSearch.value) {
    const s = userSearch.value.toLowerCase()
    filtered = filtered.filter(u =>
      [u.nickname, u.displayName, u.firstName, u.lastName].filter(Boolean).join(' ').toLowerCase().includes(s)
    )
  }
  if (membershipFilter.value !== 'all') {
    filtered = filtered.filter(u => {
      const valid = isMembershipValid(u)
      const has = !!u.membershipExpiry
      if (membershipFilter.value === 'active') return valid
      if (membershipFilter.value === 'expired') return has && !valid
      if (membershipFilter.value === 'none') return !has
      return true
    })
  }
  filtered = [...filtered].sort((a, b) => {
    switch (userSortBy.value) {
      case 'createdAt': {
        const da = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt)) : new Date(0)
        const db_ = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt)) : new Date(0)
        return db_ - da
      }
      case 'name': return (a.nickname || a.displayName || '').localeCompare(b.nickname || b.displayName || '')
      case 'membership': {
        const ea = a.membershipExpiry ? new Date(a.membershipExpiry) : new Date(0)
        const eb = b.membershipExpiry ? new Date(b.membershipExpiry) : new Date(0)
        return eb - ea
      }
      case 'role': return (a.role || 'user').localeCompare(b.role || 'user')
      default: return 0
    }
  })
  return filtered
})

const filteredBookings = computed(() => {
  let filtered = [...allBookings.value]
  if (bookingSearch.value.trim()) {
    const s = bookingSearch.value.toLowerCase().trim()
    filtered = filtered.filter(b => {
      const u = getUserProfile(b.userId)
      return [b.className, b.instructor, formatDate(b.date), b.time,
        u?.nickname, u?.displayName, u?.firstName, u?.lastName]
        .filter(Boolean).join(' ').toLowerCase().includes(s)
    })
  }
  if (bookingStatusFilter.value !== 'all') {
    filtered = filtered.filter(b => b.status === bookingStatusFilter.value)
  }
  if (bookingDateFilter.value !== 'all') {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(today); weekStart.setDate(today.getDate() - today.getDay())
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    filtered = filtered.filter(b => {
      const bd = new Date(b.date)
      const bdt = new Date(`${b.date}T${b.time}:00`)
      switch (bookingDateFilter.value) {
        case 'today': return bd.toDateString() === today.toDateString()
        case 'this-week': return bd >= weekStart
        case 'this-month': return bd >= monthStart
        case 'upcoming': return bdt >= now && b.status !== 'cancelled'
        case 'past': return bdt < now || b.status === 'cancelled'
        default: return true
      }
    })
  }
  filtered.sort((a, b) => {
    const ua = getUserProfile(a.userId), ub = getUserProfile(b.userId)
    const da = new Date(`${a.date}T${a.time}:00`), db_ = new Date(`${b.date}T${b.time}:00`)
    switch (bookingSortBy.value) {
      case 'date-asc': return da - db_
      case 'date-desc': return db_ - da
      case 'user-name': return (ua?.nickname || ua?.displayName || '').localeCompare(ub?.nickname || ub?.displayName || '', 'th')
      case 'class-name': return a.className.localeCompare(b.className, 'th')
      case 'status': return ({'confirmed':1,'completed':2,'cancelled':3}[a.status]||4) - ({'confirmed':1,'completed':2,'cancelled':3}[b.status]||4)
      default: return db_ - da
    }
  })
  return filtered
})

const bookingStats = computed(() => ({
  total: allBookings.value.length,
  confirmed: allBookings.value.filter(b => b.status === 'confirmed').length,
  completed: allBookings.value.filter(b => b.status === 'completed').length,
  cancelled: allBookings.value.filter(b => b.status === 'cancelled').length,
}))

const paginatedBookings = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredBookings.value.slice(start, start + itemsPerPage.value)
})

const totalPages = computed(() => Math.ceil(filteredBookings.value.length / itemsPerPage.value))

const groupedBookings = computed(() => {
  const groups = {}
  paginatedBookings.value.forEach(b => {
    if (!groups[b.userId]) groups[b.userId] = { userId: b.userId, user: getUserProfile(b.userId), bookings: [] }
    groups[b.userId].bookings.push(b)
  })
  Object.values(groups).forEach(g => g.bookings.sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`)))
  return Object.values(groups).sort((a, b) => b.bookings.length - a.bookings.length)
})

const hasActiveFilters = computed(() =>
  bookingSearch.value.trim() || bookingStatusFilter.value !== 'all' ||
  bookingDateFilter.value !== 'all' || bookingSortBy.value !== 'date-desc'
)

// Dashboard computed
const upcomingClassesCount = computed(() => {
  const now = new Date()
  return classes.value.filter(c => new Date(`${c.date}T${c.time}`) >= now).length
})

const activeMembers = computed(() => users.value.filter(isMembershipValid).length)

const todayBookingsCount = computed(() => {
  const today = new Date().toDateString()
  return allBookings.value.filter(b => new Date(b.date).toDateString() === today).length
})

const todayClasses = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return classes.value.filter(c => c.date === today)
})

const filteredAddMemberUsers = computed(() => {
  const s = addMemberSearch.value.toLowerCase()
  return users.value.filter(u => {
    if (!s) return true
    return [u.nickname, u.displayName, u.firstName, u.lastName]
      .filter(Boolean).join(' ').toLowerCase().includes(s)
  })
})

// ---- Data Loading ----

const loadAllData = async (forceRefresh = false) => {
  try {
    if (!forceRefresh) {
      const cc = getCachedData(CACHE_KEYS.ADMIN_CLASSES)
      const cu = getCachedData(CACHE_KEYS.ADMIN_USERS)
      const cb = getCachedData(CACHE_KEYS.ADMIN_BOOKINGS)
      if (cc && cu && cb) {
        classes.value = cc; users.value = cu
        classBookings.value = cb; allBookings.value = cb
        return
      }
    }
    const [classesSnap, usersSnap, bookingsSnap] = await Promise.all([
      getDocs(collection(db, 'classes')),
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'bookings')),
    ])
    classes.value = classesSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => {
      const now = new Date()
      const da = new Date(`${a.date}T${a.time}`), db_ = new Date(`${b.date}T${b.time}`)
      const aP = da < now, bP = db_ < now
      if (aP && !bP) return 1; if (!aP && bP) return -1
      return aP ? db_ - da : da - db_
    })
    users.value = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    const bookingsData = bookingsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    classBookings.value = bookingsData
    allBookings.value = [...bookingsData].sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`))
    setCachedData(CACHE_KEYS.ADMIN_CLASSES, classes.value)
    setCachedData(CACHE_KEYS.ADMIN_USERS, users.value)
    setCachedData(CACHE_KEYS.ADMIN_BOOKINGS, bookingsData)
  } catch (err) {
    console.error('Error loading data:', err)
  }
}

const loadCustomClassTypes = async () => {
  try {
    const snap = await getDoc(doc(db, 'settings', 'classTypes'))
    if (snap.exists()) {
      customClassSettings.value = snap.data()
    }
  } catch (err) {
    console.error('Error loading custom class types:', err)
  }
}

const saveCustomClassTypes = async () => {
  await setDoc(doc(db, 'settings', 'classTypes'), customClassSettings.value)
}

const refreshData = async () => {
  isLoading.value = true
  await Promise.all([loadAllData(true), loadCustomClassTypes()])
  isLoading.value = false
}

// ---- Class CRUD ----

const getClassBookings = (classId) =>
  classBookings.value.filter(b => b.classId === classId && b.status === 'confirmed')

const getUserProfile = (userId) => users.value.find(u => u.lineUserId === userId)

const getClassStatus = (c) => {
  const now = new Date()
  const start = new Date(`${c.date}T${c.time}`)
  const end = new Date(start.getTime() + 90 * 60 * 1000)
  if (now < start) return 'upcoming'
  if (now <= end) return 'ongoing'
  return 'completed'
}

const getClassStatusText = (c) => ({ upcoming: 'กำลังจะมา', ongoing: 'กำลังดำเนินการ', completed: 'เสร็จสิ้น' }[getClassStatus(c)] || '')

const editClass = (c) => { editingClass.value = { ...c }; showEditClassModal.value = true }

const updateClass = async () => {
  if (!editingClass.value) return
  addingClass.value = true
  try {
    const subtypeInfo = getSubtypeInfoLocal(editingClass.value.type, editingClass.value.subtype)
    if (!subtypeInfo) throw new Error('ไม่พบข้อมูลคลาส')
    await updateDoc(doc(db, 'classes', editingClass.value.id), {
      type: editingClass.value.type,
      subtype: editingClass.value.subtype,
      name: subtypeInfo.label,
      description: subtypeInfo.description,
      date: editingClass.value.date,
      time: editingClass.value.time,
      instructor: editingClass.value.instructor,
      maxCapacity: editingClass.value.maxCapacity,
      updatedAt: new Date(),
    })
    showEditClassModal.value = false
    editingClass.value = null
    await loadAllData(true)
    Swal.fire({ title: 'สำเร็จ!', text: 'แก้ไขคลาสสำเร็จ!', icon: 'success', confirmButtonText: 'ตกลง' })
  } catch (err) {
    console.error(err)
    Swal.fire({ title: 'เกิดข้อผิดพลาด!', text: 'ไม่สามารถแก้ไขคลาสได้', icon: 'error', confirmButtonText: 'ตกลง' })
  } finally {
    addingClass.value = false
  }
}

const addClass = async () => {
  addingClass.value = true
  try {
    const subtypeInfo = getSubtypeInfoLocal(newClass.value.type, newClass.value.subtype)
    if (!subtypeInfo) throw new Error('ไม่พบข้อมูลคลาส')
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
      createdAt: new Date(),
    })
    newClass.value = { type: 'yoga', subtype: '', date: '', time: '', instructor: '', maxCapacity: 10 }
    showAddClassModal.value = false
    await loadAllData(true)
    Swal.fire({ title: 'สำเร็จ!', text: 'เพิ่มคลาสสำเร็จ!', icon: 'success', confirmButtonText: 'ตกลง' })
  } catch (err) {
    console.error(err)
    Swal.fire({ title: 'เกิดข้อผิดพลาด!', text: 'ไม่สามารถเพิ่มคลาสได้', icon: 'error', confirmButtonText: 'ตกลง' })
  } finally {
    addingClass.value = false
  }
}

const deleteClass = async (yogaClass) => {
  const result = await Swal.fire({
    title: 'ยืนยันการลบ',
    text: `ลบคลาส "${yogaClass.name}"?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'ลบ',
    cancelButtonText: 'ยกเลิก',
  })
  if (!result.isConfirmed) return
  try {
    await deleteDoc(doc(db, 'classes', yogaClass.id))
    await loadAllData(true)
    Swal.fire({ title: 'สำเร็จ!', text: 'ลบคลาสสำเร็จ!', icon: 'success', confirmButtonText: 'ตกลง' })
  } catch (err) {
    console.error(err)
    Swal.fire({ title: 'เกิดข้อผิดพลาด!', text: 'ไม่สามารถลบคลาสได้', icon: 'error', confirmButtonText: 'ตกลง' })
  }
}

// ---- Remove Member from Class ----

const removeMemberFromClass = async (booking, yogaClass) => {
  const user = getUserProfile(booking.userId)
  const name = user?.nickname || user?.displayName || 'สมาชิก'
  const result = await Swal.fire({
    title: 'ลบสมาชิกออกจากคลาส',
    html: `ยืนยันการลบ <strong>${name}</strong><br>ออกจากคลาส <strong>${yogaClass.name}</strong>?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'ลบออก',
    cancelButtonText: 'ยกเลิก',
  })
  if (!result.isConfirmed) return
  try {
    await updateDoc(doc(db, 'bookings', booking.id), {
      status: 'cancelled',
      cancelledAt: new Date(),
      cancelledBy: 'admin',
    })
    await updateDoc(doc(db, 'classes', yogaClass.id), {
      currentBookings: increment(-1),
    })
    await loadAllData(true)
    Swal.fire({ title: 'สำเร็จ!', text: 'ลบสมาชิกออกจากคลาสสำเร็จ!', icon: 'success', timer: 2000, showConfirmButton: false })
  } catch (err) {
    console.error(err)
    Swal.fire({ title: 'เกิดข้อผิดพลาด!', text: 'ไม่สามารถลบสมาชิกได้', icon: 'error', confirmButtonText: 'ตกลง' })
  }
}

// ---- Add Member to Class ----

const openAddMemberModal = (yogaClass) => {
  addMemberTargetClass.value = yogaClass
  addMemberSearch.value = ''
  selectedMembersToAdd.value = []
  showAddMemberModal.value = true
}

const isAlreadyBooked = (user) => {
  if (!addMemberTargetClass.value) return false
  return classBookings.value.some(b =>
    b.classId === addMemberTargetClass.value.id && b.userId === user.lineUserId && b.status !== 'cancelled'
  )
}

const toggleMemberSelection = (user) => {
  if (isAlreadyBooked(user)) return
  const idx = selectedMembersToAdd.value.indexOf(user.lineUserId)
  if (idx === -1) selectedMembersToAdd.value.push(user.lineUserId)
  else selectedMembersToAdd.value.splice(idx, 1)
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
        canCancelUntil: new Date(`${yogaClass.date}T${yogaClass.time}:00`),
      })
      await updateDoc(doc(db, 'classes', yogaClass.id), { currentBookings: increment(1) })
    }
    showAddMemberModal.value = false
    await loadAllData(true)
    Swal.fire({ title: 'สำเร็จ!', text: `เพิ่มสมาชิก ${selectedMembersToAdd.value.length} คนสำเร็จ!`, icon: 'success', confirmButtonText: 'ตกลง' })
  } catch (err) {
    console.error(err)
    Swal.fire({ title: 'เกิดข้อผิดพลาด!', text: 'ไม่สามารถเพิ่มสมาชิกได้', icon: 'error', confirmButtonText: 'ตกลง' })
  } finally {
    addingMember.value = false
  }
}

// ---- Class Types Management ----

const addClassType = async () => {
  const val = newClassType.value.value.trim().toLowerCase().replace(/\s+/g, '-')
  const label = newClassType.value.label.trim()
  if (!val || !label) return
  if (allClassTypes.value.some(t => t.value === val)) {
    Swal.fire({ title: 'รหัสซ้ำ!', text: 'รหัสประเภทนี้มีอยู่แล้ว', icon: 'error', confirmButtonText: 'ตกลง' })
    return
  }
  addingType.value = true
  try {
    const updated = {
      ...customClassSettings.value,
      customTypes: [...(customClassSettings.value.customTypes || []), { value: val, label }],
    }
    await setDoc(doc(db, 'settings', 'classTypes'), updated)
    customClassSettings.value = updated
    newClassType.value = { value: '', label: '' }
    showAddTypeModal.value = false
    Swal.fire({ title: 'สำเร็จ!', text: `เพิ่มประเภท "${label}" สำเร็จ!`, icon: 'success', timer: 2000, showConfirmButton: false })
  } catch (err) {
    console.error(err)
    Swal.fire({ title: 'เกิดข้อผิดพลาด!', text: 'ไม่สามารถเพิ่มประเภทได้', icon: 'error', confirmButtonText: 'ตกลง' })
  } finally {
    addingType.value = false
  }
}

const deleteClassType = async (type) => {
  const result = await Swal.fire({
    title: 'ลบประเภทคลาส',
    text: `ลบประเภท "${type.label}"? คลาสย่อยทั้งหมดของประเภทนี้จะถูกลบด้วย`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'ลบ',
    cancelButtonText: 'ยกเลิก',
  })
  if (!result.isConfirmed) return
  try {
    const customTypes = (customClassSettings.value.customTypes || []).filter(t => t.value !== type.value)
    const customSubtypes = { ...(customClassSettings.value.customSubtypes || {}) }
    delete customSubtypes[type.value]
    const updated = { ...customClassSettings.value, customTypes, customSubtypes }
    await setDoc(doc(db, 'settings', 'classTypes'), updated)
    customClassSettings.value = updated
    Swal.fire({ title: 'สำเร็จ!', text: 'ลบประเภทสำเร็จ!', icon: 'success', timer: 2000, showConfirmButton: false })
  } catch (err) {
    console.error(err)
    Swal.fire({ title: 'เกิดข้อผิดพลาด!', text: 'ไม่สามารถลบประเภทได้', icon: 'error', confirmButtonText: 'ตกลง' })
  }
}

const openAddSubtypeModal = (type) => {
  addSubtypeTargetType.value = type
  newSubtype.value = { value: '', label: '', description: '' }
  showAddSubtypeModal.value = true
}

const addSubtype = async () => {
  const typeValue = addSubtypeTargetType.value?.value
  if (!typeValue) return
  const val = newSubtype.value.value.trim()
  const label = newSubtype.value.label.trim()
  const description = newSubtype.value.description.trim()
  if (!val || !label) return

  if (getAllSubtypes(typeValue).some(s => s.value === val)) {
    Swal.fire({ title: 'รหัสซ้ำ!', text: 'รหัสคลาสย่อยนี้มีอยู่แล้ว', icon: 'error', confirmButtonText: 'ตกลง' })
    return
  }
  addingSubtype.value = true
  try {
    const currentSubs = (customClassSettings.value.customSubtypes || {})[typeValue] || []
    const updated = {
      ...customClassSettings.value,
      customSubtypes: {
        ...(customClassSettings.value.customSubtypes || {}),
        [typeValue]: [...currentSubs, { value: val, label, description }],
      },
    }
    await setDoc(doc(db, 'settings', 'classTypes'), updated)
    customClassSettings.value = updated
    newSubtype.value = { value: '', label: '', description: '' }
    showAddSubtypeModal.value = false
    Swal.fire({ title: 'สำเร็จ!', text: `เพิ่มคลาสย่อย "${label}" สำเร็จ!`, icon: 'success', timer: 2000, showConfirmButton: false })
  } catch (err) {
    console.error(err)
    Swal.fire({ title: 'เกิดข้อผิดพลาด!', text: 'ไม่สามารถเพิ่มคลาสย่อยได้', icon: 'error', confirmButtonText: 'ตกลง' })
  } finally {
    addingSubtype.value = false
  }
}

const deleteSubtype = async (typeValue, subtype) => {
  const result = await Swal.fire({
    title: 'ลบคลาสย่อย',
    text: `ลบ "${subtype.label}"?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'ลบ',
    cancelButtonText: 'ยกเลิก',
  })
  if (!result.isConfirmed) return
  try {
    const currentSubs = ((customClassSettings.value.customSubtypes || {})[typeValue] || []).filter(s => s.value !== subtype.value)
    const updated = {
      ...customClassSettings.value,
      customSubtypes: { ...(customClassSettings.value.customSubtypes || {}), [typeValue]: currentSubs },
    }
    await setDoc(doc(db, 'settings', 'classTypes'), updated)
    customClassSettings.value = updated
    Swal.fire({ title: 'สำเร็จ!', icon: 'success', timer: 1500, showConfirmButton: false })
  } catch (err) {
    console.error(err)
    Swal.fire({ title: 'เกิดข้อผิดพลาด!', text: 'ไม่สามารถลบคลาสย่อยได้', icon: 'error', confirmButtonText: 'ตกลง' })
  }
}

// ---- Cooldown Management ----

const showCooldownModal = ref(false)
const cooldownTargetUser = ref(null)
const cooldownDays = ref(7)
const cooldownReason = ref('')
const settingCooldown = ref(false)

const isUserInCooldown = (user) => {
  if (!user.cooldownUntil) return false
  try {
    const d = user.cooldownUntil.toDate ? user.cooldownUntil.toDate() : new Date(user.cooldownUntil)
    return d > new Date()
  } catch { return false }
}

const getCooldownDaysLeft = (user) => {
  if (!isUserInCooldown(user)) return 0
  try {
    const d = user.cooldownUntil.toDate ? user.cooldownUntil.toDate() : new Date(user.cooldownUntil)
    return Math.ceil((d - new Date()) / (1000 * 60 * 60 * 24))
  } catch { return 0 }
}

const getCooldownEndDateDisplay = (user) => {
  if (!user.cooldownUntil) return ''
  try {
    const d = user.cooldownUntil.toDate ? user.cooldownUntil.toDate() : new Date(user.cooldownUntil)
    return formatDate(d.toISOString().split('T')[0])
  } catch { return '' }
}

const getCooldownPreviewDate = (days) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return formatDate(d.toISOString().split('T')[0])
}

const openCooldownModal = (user) => {
  cooldownTargetUser.value = user
  cooldownDays.value = isUserInCooldown(user) ? getCooldownDaysLeft(user) : 7
  cooldownReason.value = user.cooldownReason || ''
  showCooldownModal.value = true
}

const setCooldown = async () => {
  if (!cooldownTargetUser.value || cooldownDays.value < 1) return
  settingCooldown.value = true
  try {
    const cooldownUntil = new Date()
    cooldownUntil.setDate(cooldownUntil.getDate() + cooldownDays.value)
    cooldownUntil.setHours(23, 59, 59, 999)

    await updateDoc(doc(db, 'users', cooldownTargetUser.value.id), {
      cooldownUntil: Timestamp.fromDate(cooldownUntil),
      cooldownReason: cooldownReason.value.trim() || null,
      updatedAt: new Date(),
    })
    showCooldownModal.value = false
    await loadAllData(true)
    Swal.fire({
      title: 'ตั้ง Cooldown สำเร็จ!',
      html: `<strong>${cooldownTargetUser.value.nickname || cooldownTargetUser.value.displayName || 'สมาชิก'}</strong><br>ถูกระงับการจอง <strong>${cooldownDays.value} วัน</strong><br>ถึง ${getCooldownPreviewDate(cooldownDays.value)}`,
      icon: 'success',
      confirmButtonText: 'ตกลง'
    })
  } catch (err) {
    console.error(err)
    Swal.fire({ title: 'เกิดข้อผิดพลาด!', text: 'ไม่สามารถตั้ง Cooldown ได้', icon: 'error', confirmButtonText: 'ตกลง' })
  } finally {
    settingCooldown.value = false
  }
}

const clearCooldown = async (user) => {
  const result = await Swal.fire({
    title: 'ยืนยันการยกเลิก Cooldown',
    html: `ยกเลิก Cooldown ของ <strong>${user.nickname || user.displayName || 'สมาชิก'}</strong>?<br><span class="text-sm text-gray-500">สมาชิกจะสามารถจองคลาสได้ทันที</span>`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'ยืนยัน',
    cancelButtonText: 'ยกเลิก',
  })
  if (!result.isConfirmed) return
  try {
    await updateDoc(doc(db, 'users', user.id), {
      cooldownUntil: null,
      cooldownReason: null,
      updatedAt: new Date(),
    })
    await loadAllData(true)
    Swal.fire({ title: 'ยกเลิก Cooldown สำเร็จ!', icon: 'success', timer: 2000, showConfirmButton: false })
  } catch (err) {
    console.error(err)
    Swal.fire({ title: 'เกิดข้อผิดพลาด!', text: 'ไม่สามารถยกเลิก Cooldown ได้', icon: 'error', confirmButtonText: 'ตกลง' })
  }
}

// ---- User Management ----

const isMembershipValid = (user) => {
  if (!user.membershipExpiry) return false
  const exp = user.membershipExpiry.toDate ? user.membershipExpiry.toDate() : new Date(user.membershipExpiry)
  return exp > new Date()
}

const getMembershipExpiryForInput = (user) => {
  if (selectedDates.value[user.id]) return selectedDates.value[user.id]
  if (!user.membershipExpiry) return new Date().toISOString().split('T')[0]
  try {
    const d = user.membershipExpiry.toDate ? user.membershipExpiry.toDate() : new Date(user.membershipExpiry)
    return isNaN(d.getTime()) ? new Date().toISOString().split('T')[0] : d.toISOString().split('T')[0]
  } catch { return new Date().toISOString().split('T')[0] }
}

const getMembershipExpiryDisplay = (user) => {
  if (!user.membershipExpiry) return 'ไม่มี'
  try {
    const d = user.membershipExpiry.toDate ? user.membershipExpiry.toDate() : new Date(user.membershipExpiry)
    return isNaN(d.getTime()) ? 'ไม่ถูกต้อง' : formatDate(d.toISOString().split('T')[0])
  } catch { return 'ไม่ถูกต้อง' }
}

const updateMembershipExpiry = (user, val) => { selectedDates.value[user.id] = val }

const setMembershipExpiry = async (user) => {
  const date = selectedDates.value[user.id]
  if (!date) {
    Swal.fire({ title: 'กรุณาเลือกวันที่', icon: 'warning', confirmButtonText: 'ตกลง' })
    return
  }
  try {
    await updateDoc(doc(db, 'users', user.id), { membershipExpiry: Timestamp.fromDate(new Date(date)), updatedAt: new Date() })
    delete selectedDates.value[user.id]
    await loadAllData(true)
    Swal.fire({ title: 'สำเร็จ!', text: 'ตั้งวันหมดอายุสำเร็จ!', icon: 'success', confirmButtonText: 'ตกลง' })
  } catch (err) {
    console.error(err)
    Swal.fire({ title: 'เกิดข้อผิดพลาด!', text: 'ไม่สามารถบันทึกวันหมดอายุได้', icon: 'error', confirmButtonText: 'ตกลง' })
  }
}

const updateUserRole = async (user, newRole) => {
  const result = await Swal.fire({
    title: 'ยืนยันการเปลี่ยน Role',
    html: `เปลี่ยน Role ของ <strong>${user.nickname || user.displayName || 'ผู้ใช้'}</strong> เป็น <strong>${newRole === 'admin' ? 'Admin' : 'User'}</strong>?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'ยืนยัน',
    cancelButtonText: 'ยกเลิก',
  })
  if (!result.isConfirmed) { await loadAllData(); return }
  try {
    await updateDoc(doc(db, 'users', user.id), { role: newRole, updatedAt: new Date() })
    await loadAllData()
    Swal.fire({ title: 'สำเร็จ!', text: `เปลี่ยน Role เป็น ${newRole === 'admin' ? 'Admin' : 'User'} สำเร็จ!`, icon: 'success', confirmButtonText: 'ตกลง' })
  } catch (err) {
    console.error(err)
    Swal.fire({ title: 'เกิดข้อผิดพลาด!', text: 'ไม่สามารถเปลี่ยน Role ได้', icon: 'error', confirmButtonText: 'ตกลง' })
    await loadAllData()
  }
}

// ---- Booking Utilities ----

const getStatusText = (status) => ({ confirmed: 'ยืนยันแล้ว', cancelled: 'ยกเลิกแล้ว', completed: 'เสร็จสิ้น' }[status] || status)
const getStatusColor = (status) => ({ confirmed: 'bg-emerald-100 text-emerald-700', cancelled: 'bg-red-100 text-red-600', completed: 'bg-blue-100 text-blue-600' }[status] || 'bg-gray-100 text-gray-500')

const getTodayBookingsCount = () => {
  const today = new Date().toDateString()
  return allBookings.value.filter(b => new Date(b.date).toDateString() === today).length
}

const getUpcomingBookingsCount = () => {
  const now = new Date()
  return allBookings.value.filter(b => new Date(`${b.date}T${b.time}:00`) >= now && b.status !== 'cancelled').length
}

const clearAllFilters = () => {
  bookingSearch.value = ''; bookingStatusFilter.value = 'all'
  bookingDateFilter.value = 'all'; bookingSortBy.value = 'date-desc'
  currentPage.value = 1
}

const highlightSearchTerm = (text) => {
  const q = bookingSearch.value.trim()
  if (!q || !text) return text
  return String(text).replace(new RegExp(`(${q})`, 'gi'), '<mark class="bg-yellow-200 px-0.5 rounded">$1</mark>')
}

const getVisiblePages = () => {
  const pages = [], max = 5
  let start = Math.max(1, currentPage.value - Math.floor(max / 2))
  let end = Math.min(totalPages.value, start + max - 1)
  if (end - start + 1 < max) start = Math.max(1, end - max + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
}

const getVisibleClassPages = () => {
  const pages = [], max = 5
  let start = Math.max(1, currentClassPage.value - Math.floor(max / 2))
  let end = Math.min(totalClassPages.value, start + max - 1)
  if (end - start + 1 < max) start = Math.max(1, end - max + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
}

// ---- Format Helpers ----

const formatDate = (dateString) => {
  if (!dateString) return 'ไม่มีข้อมูล'
  try {
    const d = new Date(dateString)
    return isNaN(d.getTime()) ? 'วันที่ไม่ถูกต้อง' : format(d, 'dd MMMM yyyy', { locale: th })
  } catch { return 'วันที่ไม่ถูกต้อง' }
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  try {
    const d = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp)
    return isNaN(d.getTime()) ? '' : format(d, 'HH:mm', { locale: th })
  } catch { return '' }
}

// ---- CSV Export ----

const exportBookingsToCSV = () => {
  if (filteredBookings.value.length === 0) {
    Swal.fire({ title: 'ไม่มีข้อมูล', icon: 'warning', confirmButtonText: 'ตกลง' })
    return
  }
  const headers = ['วันที่จอง', 'เวลา', 'ชื่อคลาส', 'ครูผู้สอน', 'ชื่อผู้จอง', 'ชื่อจริง', 'นามสกุล', 'สถานะ', 'วันที่ทำการจอง']
  const rows = filteredBookings.value.map(b => {
    const u = getUserProfile(b.userId)
    let bookedAt = ''
    if (b.bookedAt) {
      try {
        const d = b.bookedAt.toDate ? b.bookedAt.toDate() : new Date(b.bookedAt)
        if (!isNaN(d.getTime())) bookedAt = formatDate(d.toISOString().split('T')[0])
      } catch {}
    }
    return [formatDate(b.date), b.time, b.className, b.instructor, u?.nickname || u?.displayName || '', u?.firstName || '', u?.lastName || '', getStatusText(b.status), bookedAt]
  })
  const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`
  a.style.display = 'none'
  document.body.appendChild(a); a.click(); document.body.removeChild(a)
  Swal.fire({ title: 'Export สำเร็จ!', icon: 'success', timer: 1500, showConfirmButton: false })
}

// ---- Watchers ----

watch(() => newClass.value.type, () => { newClass.value.subtype = '' })
watch(() => editingClass.value?.type, () => { if (editingClass.value) editingClass.value.subtype = '' })
watch([bookingSearch, bookingStatusFilter, bookingDateFilter, bookingSortBy], () => { currentPage.value = 1 })
watch(classDateFilter, () => { currentClassPage.value = 1 })

onMounted(async () => {
  isLoading.value = true
  await Promise.all([loadAllData(), loadCustomClassTypes()])
  isLoading.value = false
})
</script>
