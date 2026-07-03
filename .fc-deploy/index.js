// Web函数模式 - bootstrap直接启动server.js
// 在FC Custom Runtime中，server监听9000端口即可

// 注意：这个文件仅在nodejs20运行时作为事件函数使用
// 对于custom.debian10运行时，使用bootstrap脚本直接启动server.js
exports.handler = async (event, context) => {
  // 对于Custom Runtime，这个handler不会被调用
  // HTTP请求直接转发到监听9000端口的服务器
  return new Promise((resolve) => {
    const http = require("http");
    const { spawn } = require("child_process");
    
    const server = spawn("node", ["server.js"], {
      cwd: __dirname,
      stdio: "inherit",
      env: { ...process.env, PORT: "9000" },
    });
    
    server.on("exit", (code) => {
      console.log(`Next.js exited with code ${code}`);
      resolve({ statusCode: 500, body: "Server stopped" });
    });
  });
};
