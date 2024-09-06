# cursor-sonnect-replace
使用自定义apikey 替代换房的apikey

1.仍使用使用自定义apikey 第三方的apikey
2.使用自定义模型名称
claude-3-5-sonnet-20240620
claude-3-haiku-20240307
claude-3-opus-20240229
claude-3-sonnet-20240229
分别替换为
mysonnet-20240620
mysonnet-haiku-20240307
mysonnet-opus-20240229
mysonnet-20240229
3.部署work.js 复制代码到cloudflared 使用work和page功能
使用部署后的域名访问 原来的访问方式是https://api.zyai.online/v1
替换为https://**.**.workers.dev/v1
4.其他的客户端均可这样设置。 chatbox nextchat等
设置apikey 和模型名称
