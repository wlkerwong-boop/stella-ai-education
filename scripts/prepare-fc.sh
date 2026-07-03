#!/bin/bash
# FC部署准备脚本
# 用法: ./scripts/prepare-fc.sh

set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
FC_DIR="$ROOT_DIR/.fc-deploy"

echo "=== 1. 构建 Next.js ==="
cd "$ROOT_DIR"
npm run build

echo ""
echo "=== 2. 清理旧部署目录 ==="
rm -rf "$FC_DIR"

echo ""
echo "=== 3. 复制 Standalone 输出 ==="
cp -r .next/standalone/. "$FC_DIR/"

echo ""
echo "=== 4. 复制静态资源 ==="
# .next/static 需要被复制到 standalone 内
cp -r .next/static "$FC_DIR/.next/static"
# public 目录
cp -r public "$FC_DIR/public"

echo ""
echo "=== 5. 创建 bootstrap 启动脚本 ==="
cat > "$FC_DIR/bootstrap" << 'BOOTSTRAP_EOF'
#!/bin/bash
cd "$(dirname "$0")"
export NODE_ENV=production
exec node server.js
BOOTSTRAP_EOF
chmod +x "$FC_DIR/bootstrap"

echo ""
echo "=== 6. 部署包准备完成 ==="
find "$FC_DIR" -maxdepth 2 -type f | head -30
echo "..."
echo ""
du -sh "$FC_DIR"
echo ""
echo "✅ FC部署包已准备好: $FC_DIR"
echo "运行 's deploy' 即可部署到阿里云"
