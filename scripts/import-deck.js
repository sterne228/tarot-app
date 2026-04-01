#!/usr/bin/env node
/**
 * 🃏 牌组自动导入脚本
 * 
 * 使用方法：
 *   npm run import-decks
 * 
 * 文件夹规范 (public/decks/<牌组文件夹名>/):
 *   _config.json    ← 牌组元信息（名称、中文名等）
 *   back.jpg/png    ← 牌背图片（所有牌共用的背面）
 *   cover.jpg/png   ← 牌组封面图（展示在选牌界面）
 *   01-愚者.jpg     ← 牌面图片，按文件名排序
 *   02-魔术师.png   ← 支持 jpg/png/webp
 *   ...
 * 
 * _config.json 格式：
 * {
 *   "name": "My Custom Tarot",
 *   "nameCN": "我的自定义塔罗",
 *   "majorArcanaCount": 22
 * }
 * 
 * 如果没有 _config.json，脚本会用文件夹名自动生成。
 * 如果没有 back.jpg，会使用默认牌背。
 * 如果没有 cover.jpg，会用第一张牌的图当封面。
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DECKS_DIR = path.resolve(__dirname, '../public/decks');
const OUTPUT_FILE = path.resolve(__dirname, '../src/data/generatedDecks.js');

const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const RESERVED_FILES = ['_config.json', 'back', 'cover'];

function isImageFile(filename) {
  return IMAGE_EXTS.includes(path.extname(filename).toLowerCase());
}

function isReservedFile(filename) {
  const base = path.parse(filename).name.toLowerCase();
  return RESERVED_FILES.includes(base) || filename === '_config.json';
}

function findFileWithExts(dir, baseName) {
  for (const ext of IMAGE_EXTS) {
    const filePath = path.join(dir, baseName + ext);
    if (fs.existsSync(filePath)) {
      return baseName + ext;
    }
  }
  return null;
}

function scanDeck(deckFolderName) {
  const deckPath = path.join(DECKS_DIR, deckFolderName);
  const stat = fs.statSync(deckPath);
  if (!stat.isDirectory()) return null;

  // 读取配置
  const configPath = path.join(deckPath, '_config.json');
  let config = {};
  if (fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch (e) {
      console.warn(`  ⚠️  ${deckFolderName}/_config.json 格式错误，使用默认值`);
    }
  }

  // 扫描牌面图片（排除 back/cover/_config）
  const allFiles = fs.readdirSync(deckPath);
  const cardImages = allFiles
    .filter(f => isImageFile(f) && !isReservedFile(f))
    .sort((a, b) => a.localeCompare(b, 'zh-CN', { numeric: true }));

  if (cardImages.length === 0) {
    console.warn(`  ⚠️  ${deckFolderName}/ 中没有找到牌面图片，跳过`);
    return null;
  }

  // 查找牌背和封面
  const backFile = findFileWithExts(deckPath, 'back');
  const coverFile = findFileWithExts(deckPath, 'cover');

  const majorCount = config.majorArcanaCount || 22;
  const deckName = config.name || deckFolderName.replace(/[-_]/g, ' ');

  const deck = {
    id: deckFolderName,
    name: deckName,
    nameCN: config.nameCN || config.name || deckFolderName,
    backImage: backFile ? `/decks/${deckFolderName}/${backFile}` : null,
    coverImage: coverFile
      ? `/decks/${deckFolderName}/${coverFile}`
      : `/decks/${deckFolderName}/${cardImages[0]}`,
    cards: cardImages.map((filename, index) => {
      // 从文件名提取卡牌名：去掉前缀数字、符号转空格
      const baseName = path.parse(filename).name;
      let cardName = baseName.replace(/^\d+[-_.\s+]*/, '').replace(/[-_+]/g, ' ').trim() || `Card ${index + 1}`;

      return {
        id: `${deckFolderName}-${index}`,
        name: cardName,
        description: config.descriptions?.[index] || `${cardName} - ${deckName}`,
        image_url: `/decks/${deckFolderName}/${filename}`,
        isMajor: index < majorCount,
      };
    }),
  };

  return deck;
}

function main() {
  console.log('');
  console.log('🃏 Star Cat 牌组导入工具');
  console.log('========================');
  console.log(`📂 扫描目录: ${DECKS_DIR}`);
  console.log('');

  if (!fs.existsSync(DECKS_DIR)) {
    fs.mkdirSync(DECKS_DIR, { recursive: true });
    console.log('📁 已创建 public/decks/ 目录');
    fs.writeFileSync(OUTPUT_FILE, `export const GENERATED_DECKS = [];\n`, 'utf-8');
    console.log('');
    console.log('请按以下结构放入牌组图片：');
    console.log('');
    console.log('  public/decks/');
    console.log('    my-tarot/');
    console.log('      _config.json    ← 可选：牌组配置');
    console.log('      back.jpg        ← 可选：牌背图片');
    console.log('      cover.jpg       ← 可选：封面图片');
    console.log('      01-愚者.jpg     ← 牌面图片');
    console.log('      02-魔术师.jpg');
    console.log('      ...');
    console.log('');
    return;
  }

  const folders = fs.readdirSync(DECKS_DIR).filter(f => {
    const fullPath = path.join(DECKS_DIR, f);
    return fs.statSync(fullPath).isDirectory() && !f.startsWith('.');
  });

  if (folders.length === 0) {
    console.log('❌ 没有找到任何牌组文件夹');
    console.log('   请在 public/decks/ 下创建牌组子文件夹');
    return;
  }

  const decks = [];
  for (const folder of folders) {
    console.log(`📦 扫描牌组: ${folder}/`);
    const deck = scanDeck(folder);
    if (deck) {
      decks.push(deck);
      console.log(`   ✅ ${deck.name} (${deck.nameCN}) - ${deck.cards.length} 张牌`);
      if (deck.backImage) console.log(`   🎴 牌背: ${deck.backImage}`);
      if (deck.coverImage) console.log(`   🖼️  封面: ${deck.coverImage}`);
    }
  }

  const output = `// ⚠️ 此文件由 import-deck.js 自动生成，请勿手动编辑
// 最后生成时间: ${new Date().toLocaleString('zh-CN')}
// 牌组数量: ${decks.length}

export const GENERATED_DECKS = ${JSON.stringify(decks, null, 2)};
`;

  fs.writeFileSync(OUTPUT_FILE, output, 'utf-8');

  if (decks.length === 0) {
    console.log('');
    console.log('❌ 没有成功导入任何牌组');
    return;
  }

  console.log('');
  console.log(`✨ 成功导入 ${decks.length} 套牌组！`);
  console.log(`📄 已生成: src/data/generatedDecks.js`);
  console.log('');
  console.log('刷新浏览器即可在牌组选择页看到新牌组。');
  console.log('');
}

main();
