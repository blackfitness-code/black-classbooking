// ประเภทคลาสออกกำลังกายที่รองรับ
export const CLASS_TYPES = [
  { value: 'yoga', label: 'โยคะ', icon: '🧘', color: 'purple' },
  { value: 'dance', label: 'เต้น', icon: '💃', color: 'blue' }
]

export const getClassTypeInfo = (type) => {
  return CLASS_TYPES.find(ct => ct.value === type) || CLASS_TYPES[0]
}

export const getClassTypeColor = (type) => {
  const info = getClassTypeInfo(type)
  const colorMap = {
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200'
  }
  return colorMap[info.color] || colorMap.purple
}
