// ประเภทคลาสออกกำลังกายที่รองรับ
export const CLASS_TYPES = [
  {
    value: 'yoga',
    label: 'Yoga',
    iconPath: 'M12 2C10.9 2 10 2.9 10 4s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-1 17.93c-2.76-.3-5-2.54-5.3-5.3-.3-2.76 1.47-5.3 4.2-5.9v2.02c-1.7.6-2.9 2.2-2.9 4.05 0 2.48 2.02 4.5 4.5 4.5.85 0 1.64-.22 2.33-.6l1.42 1.42c-1.11.64-2.4 1.01-3.75 1.01-1.31 0-2.54-.33-3.61-.9zm7.91-5.63c-.3 2.76-2.54 5-5.3 5.3v-2.02c1.7-.6 2.9-2.2 2.9-4.05 0-2.48-2.02-4.5-4.5-4.5-.85 0-1.64.22-2.33.6L7.26 7.21c1.11-.64 2.4-1.01 3.75-1.01 4.14 0 7.5 3.36 7.5 7.5 0 .4-.03.79-.09 1.17z',
    color: 'black'
  },
  {
    value: 'dancing',
    label: 'Dancing',
    iconPath: 'M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z',
    color: 'black'
  }, 
    {
    value: 'wellness',
    label: 'Wellness',
    iconPath: 'M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z',
    color: 'black'
  }
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
      value: 'Hatha Vinyasa flow',
      label: 'Hatha Vinyasa flow',
      description: 'คลาสผสมผสานอาสนะโยคะนำมาเรียงร้อยให้ต่อเนื่องแบบไหลลื่น โดยฟังเสียงของร่างกายและลมหายใจของผู้ฝึกเป็นหลัก คลาสนี้เหมาะกับคนที่มีพื้นฐานฝึกมาบ้างแล้ว'
    },
    {
      value: 'relaxing-recharge',
      label: 'Relaxing Recharge',
      description: 'โยคะเพื่อการผ่อนคลายและเติมพลังงาน เน้นการยืดเหยียดอย่างนุ่มนวลและการหายใจ เหมาะสำหรับการคลายเครียดและฟื้นฟูพลังงาน'
    },
    {
      value: 'yoga-advance',
      label: 'Yoga : Advance',
      description: 'คลาสนี้ออกแบบมาเพื่อผู้ฝึกที่มีประสบการณ์ โดยมักมีความเข้มข้นสูง ใช้ท่าที่ซับซ้อน เช่น การทรงตัวด้วยแขน การดัดตัว เพื่อสร้างความแข็งแรง ความยืดหยุ่น และ สมาธิที่ลึกซึ้ง'
    },
    {
      value: 'ashtanga',
      label: 'Ashtanga',
      description: 'โยคะสไตล์อัษฏางคะที่เน้นการเคลื่อนไหวอย่างต่อเนื่องและมีพลัง ผสมผสานการหายใจกับท่าทางที่เป็นลำดับ เหมาะสำหรับผู้ที่ต้องการความท้าทาย'
    },
     {
      value: 'Power',
      label: 'Power',
      description: 'โยคะที่มีการเคลื่อนไหวที่รวดเร็ว ต่อเนื่อง ฝึกความอดทนของร่างกาย'
    },
      {
      value: 'pilates-mate',
      label: 'Pilates Mat',
      description: 'พิลาทิสบนเสื่อที่เน้นการฝึกกล้ามเนื้อส่วนกลางลำตัว (Core) ช่วยปรับสมดุลร่างกาย เพิ่มความยืดหยุ่น และสร้างกล้ามเนื้อที่แข็งแรงยาว'
    },
    {
      value: 'mixed-yoga',
      label: 'Mixed Yoga',
      description: 'คลาสโยคะที่ผสมผสานโยคะดั้งเดิมเข้ากับการออกกำลังกายรูปแบบอื่น เพื่อให้ได้ทั้งความยืดหยุ่น ความแข็งแรง และการเผาผลาญที่มากกว่าโยคะปกติ'
    },
    {
      value: 'flow-yoga',
      label: 'Flow Yoga',
      description: 'โยคะที่มีการเคลื่อนไหว ผสมผสาน จากท่าหนึ่งไปอีกท่าหนึ่ง ที่สอดคล้องกันอย่างต่อเนื่อง เพิ่มความแข็งแรงและยืดหยุ่นอย่างลงตัว'
    }
  ],
  dancing: [
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
  ] , 
  wellness: [
    {
      value: 'Sound bath',
      label: 'Sound bath',
      description: 'การบำบัดหรือการผ่อนคลายด้วย “เสียงและการสั่นสะเทือนของคลื่นเสียง” 🎶 โดยเครื่องมืออย่าง ขันทิเบต ทั้งเสียงและแรงสั่นสะเทือนจะสามารถช่วยปรับคลื่นความถี่การทำงานของสมองจนเข้าสู่ภาวะสงบได้ เราจึงสามารถเยียวยาตัวเองได้ทั้งทางร่างกายและจิตใจ'
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
    black: 'bg-gray-100 text-black border-gray-300',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200'
  }
  return colorMap[info.color] || colorMap.black
}
