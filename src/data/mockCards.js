export const CARD_BACK_IMAGE = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop';

export const MOCK_CARDS = [
  {
    id: 'card-0',
    name: '愚者 (The Fool)',
    description: '象征：新的开始、潜能、自发性。准备好踏上未知的旅程，凭直觉行事。',
    image_url: 'https://images.unsplash.com/photo-1618398188185-115d9cfbf7ba?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'card-1',
    name: '魔术师 (The Magician)',
    description: '象征：行动、力量、创造。你拥有实现目标的所有资源与能力。',
    image_url: 'https://images.unsplash.com/photo-1519098901909-b1553a1190af?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'card-2',
    name: '女祭司 (The High Priestess)',
    description: '象征：直觉、潜意识、奥秘。向内探索，相信你的直觉而非逻辑。',
    image_url: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'card-3',
    name: '女皇 (The Empress)',
    description: '象征：母性、丰收、自然。孕育新的生命或计划，享受感官带来的喜悦。',
    image_url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'card-4',
    name: '皇帝 (The Emperor)',
    description: '象征：权威、结构、稳固。建立规则与秩序，承担起领导的责任。',
    image_url: 'https://images.unsplash.com/photo-1533038590840-1cbea6a66016?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'card-5',
    name: '教皇 (The Hierophant)',
    description: '象征：信仰、传统、教育。遵循既定的社会规范，或者寻找一位精神导师。',
    image_url: 'https://images.unsplash.com/photo-1550503112-2eb4d5fa04e2?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'card-6',
    name: '恋人 (The Lovers)',
    description: '象征：爱情、和谐、选择。面临价值观的抉择，或是一段重要人际关系的结合。',
    image_url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'card-7',
    name: '战车 (The Chariot)',
    description: '象征：意志、控制、胜利。克服对立的矛盾，凭坚定意志取得成功。',
    image_url: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'card-8',
    name: '力量 (Strength)',
    description: '象征：勇气、耐心、同情。用温和内在的力量去驯服内心的恐惧野兽。',
    image_url: 'https://images.unsplash.com/photo-1560707303-4e980ce87606?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'card-9',
    name: '隐士 (The Hermit)',
    description: '象征：孤独、反思、向导。暂时退出喧嚣，在独处中寻找灵魂之光。',
    image_url: 'https://images.unsplash.com/photo-1447014421976-7fec21d26d86?q=80&w=600&auto=format&fit=crop',
  }
];

// Generates up to 78 cards dynamically for testing the UI
for (let i = 10; i < 78; i++) {
  MOCK_CARDS.push({
    id: `card-${i}`,
    name: `Card ${i + 1}`,
    description: `这是塔罗牌系统中的第 ${i + 1} 张牌，代表了某种神秘的潜能与指引。详细解析待完善。`,
    image_url: 'https://images.unsplash.com/photo-1534796636918-9f1d0ca25e22?q=80&w=600&auto=format&fit=crop',
  });
}
