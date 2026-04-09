#!/bin/bash

# 判断是否传入了必要参数
if [ -z "$1" ] || [ -z "$2" ]; then
  echo "❌ 错误: 缺少参数！"
  echo "用法: npm run add-deck <牌组名称> <素材文件夹路径>"
  echo "示例: npm run add-deck new-deck ~/Documents/assets"
  exit 1
fi

DECK_NAME=$1
SOURCE_DIR=$2
TARGET_DIR="public/decks/$DECK_NAME"

# 检查源目录是否存在
if [ ! -d "$SOURCE_DIR" ]; then
  echo "❌ 错误: 找不到素材文件夹: $SOURCE_DIR"
  exit 1
fi

echo "🃏 正在导入新牌组: $DECK_NAME"
echo "📂 源文件夹: $SOURCE_DIR"

# 1. 创建目标目录
mkdir -p "$TARGET_DIR"

# 2. 复制图片
echo "📦 正在提取图片..."
cp -r "$SOURCE_DIR"/*.png "$SOURCE_DIR"/*.jpg "$SOURCE_DIR"/*.jpeg "$TARGET_DIR"/ 2>/dev/null

# 3. 压缩图片 (将所有 PNG 转为 JPG，这为了防止浏览器内存爆仓)
echo "🗜️ 正在压缩并优化图片 (无损缩小至 800px、转为 JPG)..."
for f in "$TARGET_DIR"/*.png; do
  if [ -f "$f" ]; then
    newname="${f%.png}.jpg"
    # 用 macOS 自带的 sips 进行按比例缩放（最大边 800px），并转为 jpg
    sips -Z 800 -s format jpeg -s formatOptions 75 "$f" --out "$newname" >/dev/null 2>&1
    if [ $? -eq 0 ]; then
       rm "$f" # 转换成功后删除原体积庞大的 png
    fi
  fi
done

# 对于源文件原本就是 jpg/jpeg 的，也进行一次缩放压缩
for f in "$TARGET_DIR"/*.jpg "$TARGET_DIR"/*.jpeg; do
  if [ -f "$f" ]; then
    sips -Z 800 -s formatOptions 75 "$f" --out "$f" >/dev/null 2>&1
  fi
done

# 4. 替换文件名里的空格和特殊符号为横杠 (-)
echo "🧹 正在清理文件名非法字符..."
for f in "$TARGET_DIR"/*; do
  dir=$(dirname "$f")
  base=$(basename "$f")
  # 把空格和加号替换为横杠，转大写为小写
  new_base=$(echo "$base" | tr ' ' '-' | tr '+' '-' | tr '[:upper:]' '[:lower:]')
  
  if [ "$base" != "$new_base" ]; then
    mv "$f" "$dir/$new_base"
  fi
done

# 5. 调用原有的 Nodejs 脚本导入数据
echo "⚙️ 正在生成网页数据..."
node scripts/import-deck.js

echo "✅ 牌组导入完成！现在刷新浏览器即可看到。并且你的线上版本已准备好，只需要运行 npx vercel --prod 上传即可。"
