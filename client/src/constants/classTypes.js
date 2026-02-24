// ประเภทคลาสออกกำลังกายที่รองรับ
export const CLASS_TYPES = [
  { value: 'yoga', label: 'โยคะ', icon: '🧘', color: 'purple' },
  { value: 'dance', label: 'เต้น', icon: '💃', color: 'blue' }
]

// คลาสย่อยของแต่ละประเภท พร้อม description ที่แก้ไขไม่ได้
export const CLASS_SUBTYPES = {
  yoga: [
    {
      value: 'strength-restoring',
      label: 'Strength & Restoring',
      description: 'คลาสที่ผสมผสานระหว่างการสร้างความแข็งแรงให้กล้ามเนื้อและการฟื้นฟูร่างกาย เหมาะสำหรับผู้ที่ต้องการทั้งความแข็งแรงและการผ่อนคลาย'
    },
    {
      value: 'relaxing-recharge',
      label: 'Relaxing Recharge',
      description: 'โยคะเพื่อการผ่อนคลายและเติมพลังงาน เน้นการยืดเหยียดอย่างนุ่มนวลและการหายใจ เหมาะสำหรับการคลายเครียดและฟื้นฟูพลังงาน'
    },
    {
      value: 'yoga-advance',
      label: 'Yoga : Advance',
      description: 'โยคะระดับสูงสำหรับผู้ที่มีพื้นฐานแล้ว ท่าทางท้าทายและซับซ้อนมากขึ้น ต้องการความแข็งแรง ความยืดหยุ่น และสมาธิในระดับสูง'
    },
    {
      value: 'ashtanga',
      label: 'Ashtanga',
      description: 'โยคะสไตล์อัษฏางคะที่เน้นการเคลื่อนไหวอย่างต่อเนื่องและมีพลัง ผสมผสานการหายใจกับท่าทางที่เป็นลำดับ เหมาะสำหรับผู้ที่ต้องการความท้าทาย'
    }
  ],
  dance: [
    {
      value: 'easy-dance',
      label: 'Easy Dance',
      description: 'คลาสเต้นเบื้องต้นที่เน้นความสนุกสนาน ท่าเต้นง่ายๆ ที่ทุกคนทำตามได้ เหมาะสำหรับผู้เริ่มต้นหรือผู้ที่ต้องการออกกำลังกายแบบสบายๆ'
    },
    {
      value: 'aerobic',
      label: 'Aerobic',
      description: 'แอโรบิกเต้นตามจังหวะเพลง เน้นการเคลื่อนไหวอย่างต่อเนื่องเพื่อเพิ่มการทำงานของหัวใจและปอด ช่วยเผาผลาญไขมันและสร้างความแข็งแรง'
    },
    {
      value: 'pilates-mate',
      label: 'Pilates Mat',
      description: 'พิลาทิสบนเสื่อที่เน้นการฝึกกล้ามเนื้อส่วนกลางลำตัว (Core) ช่วยปรับสมดุลร่างกาย เพิ่มความยืดหยุ่น และสร้างกล้ามเนื้อที่แข็งแรงยาว'
    },
    {
      value: 'aero-boxing',
      label: 'Aero Boxing',
      description: 'การออกกำลังกายที่ผสมผสานระหว่างแอโรบิกและมวย เคลื่อนไหวเต็มที่ เผาผลาญแคลอรี่สูง เหมาะสำหรับผู้ที่ต้องการความท้าทายและพลังงานสูง'
    },
    {
      value: 'dance-burn',
      label: 'Dance Burn',
      description: 'เต้นเพื่อเผาผลาญแคลอรี่สูงสุด ท่าเต้นที่มีพลังและเคลื่อนไหวเร็ว ช่วยกระชับสัดส่วนและเพิ่มความแข็งแรงให้ร่างกาย'
    },
    {
      value: 'zumba',
      label: 'Zumba',
      description: 'ซุมบ้าเต้นตามจังหวะเพลงลาตินที่สนุกสนาน เคลื่อนไหวง่ายตามได้ เหมาะสำหรับทุกคนที่ต้องการออกกำลังกายแบบสนุกและเผาผลาญแคลอรี่'
    },
    {
      value: 'dance-variety',
      label: 'Dance Variety',
      description: 'คลาสเต้นหลากหลายสไตล์ ผสมผสานท่าเต้นจากหลายแนวเพลง ไม่ซ้ำซาก เหมาะสำหรับผู้ที่ชอบความหลากหลายและความท้าทายใหม่ๆ'
    },
    {
      value: 'piloxing',
      label: 'Piloxing',
      description: 'การออกกำลังกายที่ผสมผสานระหว่างพิลาทิส มวย และเต้น ช่วยเสริมสร้างความแข็งแรง ความยืดหยุ่น และเผาผลาญแคลอรี่ในเวลาเดียวกัน'
    }
  ]
}

export const getClassTypeInfo = (type) => {
  return CLASS_TYPES.find(ct => ct.value === type) || CLASS_TYPES[0]
}

export const getClassSubtypeInfo = (type, subtype) => {
  const subtypes = CLASS_SUBTYPES[type] || []
  return subtypes.find(st => st.value === subtype) || null
}

export const getClassSubtypes = (type) => {
  return CLASS_SUBTYPES[type] || []
}

export const getClassTypeColor = (type) => {
  const info = getClassTypeInfo(type)
  const colorMap = {
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200'
  }
  return colorMap[info.color] || colorMap.purple
}
