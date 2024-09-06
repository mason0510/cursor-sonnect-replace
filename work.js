addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
    console.log(`收到 ${request.method} 请求到 ${request.url}`);

    if (request.method === 'OPTIONS') {
        console.log('处理 CORS 预检请求');
        return handleCORS(request);
    }

    if (request.url.includes('/v1/chat/completions') && request.method === 'POST') {
        console.log('处理聊天完成请求');
        return handleChatCompletion(request);
    }

    console.log('未找到匹配的路由，返回 404');
    return new Response('未找到', { status: 404, headers: corsHeaders() });
}

function handleCORS(request) {
    console.log('设置 CORS 头');
    return new Response(null, {
        status: 204,
        headers: corsHeaders()
    });
}

async function handleChatCompletion(request) {
    try {
        console.log('解析请求体');
        const requestData = await request.json();
        console.log('收到的请求数据:', JSON.stringify(requestData));

        // 模型名称映射
        if (requestData.model === "mysonnet-20240620") {
            console.log('将模型名称映射为 claude-3-5-sonnet-20240620');
            requestData.model = "claude-3-5-sonnet-20240620";
        } else if (requestData.model === "mysonnet-haiku-20240307") {
            console.log('将模型名称映射为 claude-3-haiku-20240307');
            requestData.model = "claude-3-haiku-20240307";
        } else if (requestData.model === "mysonnet-opus-20240229") {
            console.log('将模型名称映射为 claude-3-opus-20240229');
            requestData.model = "claude-3-opus-20240229";
        } else if (requestData.model === "mysonnet-20240229") {
            console.log('将模型名称映射为 claude-3-sonnet-20240229');
            requestData.model = "claude-3-sonnet-20240229";
        } else {
            console.log(`没有找到模型 ${requestData.model} 的映射，保持原样`);
        }

        // 构建新的请求体
        const newBody = JSON.stringify(requestData);
        console.log('新的请求体:', newBody);

        console.log('转发请求到 https://api.zyai.online/v1/chat/completions');
        // 转发请求到实际的 API
        const response = await fetch("https://api.zyai.online/v1/chat/completions", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': request.headers.get('Authorization')
            },
            body: newBody
        });

        console.log('收到来自 API 的响应');

        // 检查是否为流式响应
        const isStream = requestData.stream === true;

        if (isStream) {
            // 处理流式响应
            const { readable, writable } = new TransformStream();
            response.body.pipeTo(writable);
            return new Response(readable, {
                headers: {
                    ...corsHeaders(),
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive'
                }
            });
        } else {
            // 处理非流式响应
            const responseData = await response.json();
            console.log('响应数据:', JSON.stringify(responseData));
            return new Response(JSON.stringify(responseData), {
                status: response.status,
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders()
                }
            });
        }
    } catch (error) {
        console.error('处理请求时出错:', error);
        return new Response(JSON.stringify({ error: '内部服务器错误', details: error.message }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders()
            }
        });
    }
}

// 添加 corsHeaders 函数定义
function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
}
