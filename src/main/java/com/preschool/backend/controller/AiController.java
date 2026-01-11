package com.preschool.backend.controller;

import cn.hutool.http.HttpRequest;
import cn.hutool.http.HttpResponse;
import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin
public class AiController {

    private static final Logger logger = Logger.getLogger(AiController.class.getName());

    @Value("${deepseek.api.key}")
    private String apiKey;

    @Value("${deepseek.api.url}")
    private String apiUrl;

    @PostMapping("/generate")
    public ResponseEntity<?> generateComment(@RequestBody Map<String, String> params) {
        String studentName = params.get("studentName");
        String keywords = params.get("keywords");

        // 1. 如果用户没有配置 Key，或者填的是 mock，我们就返回模拟数据（方便测试）
        if (apiKey == null || apiKey.contains("你的_API_KEY") || "mock".equals(apiKey)) {
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            } // 假装思考1秒
            Map<String, String> mockResult = new HashMap<>();
            mockResult.put("result",
                    "【模拟AI回复】" + studentName + "今天表现非常棒！" + keywords + "，展现出了极强的专注力和动手能力，老师为你点赞！(请配置真实Key以获取更好效果)");
            return ResponseEntity.ok(mockResult);
        }

        try {
            // 2. 准备发给 DeepSeek 的数据
            // 提示词 (Prompt)：告诉 AI 它的身份和任务
            String systemPrompt = "你是一名有着10年经验的资深幼儿园老师，擅长用温馨、鼓励、高情商的语气与家长沟通。请根据用户提供的【学生姓名】和【行为关键词】，扩写成一段100字左右的课后反馈评语。语气要亲切，多用赞美之词，不要有AI的感觉，要自然。";
            String userPrompt = "学生姓名：" + studentName + "，行为关键词：" + keywords;

            // 构造请求体 (JSON格式)
            JSONObject requestBody = new JSONObject();
            requestBody.set("model", "deepseek-chat"); // 模型名称
            requestBody.set("temperature", 1.3); // 创意度 (越高越活泼)

            JSONArray messages = new JSONArray();
            messages.add(new JSONObject().set("role", "system").set("content", systemPrompt));
            messages.add(new JSONObject().set("role", "user").set("content", userPrompt));
            requestBody.set("messages", messages);

            // 3. 发送请求给 DeepSeek
            HttpResponse response = HttpRequest.post(apiUrl)
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .body(requestBody.toString())
                    .timeout(20000) // 设置超时时间 20秒
                    .execute();

            // 4. 解析结果
            String body = response.body();

            JSONObject jsonResponse = JSONUtil.parseObj(body);
            // 提取 AI 说的话 (DeepSeek 的返回结构是 choices[0].message.content)
            String content = jsonResponse.getJSONArray("choices")
                    .getJSONObject(0)
                    .getJSONObject("message")
                    .getStr("content");

            Map<String, String> result = new HashMap<>();
            result.put("result", content);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            logger.log(Level.SEVERE, "AI 生成评语失败: " + e.getMessage(), e);
            Map<String, String> errorResult = new HashMap<>();
            errorResult.put("error", "AI 思考过度短路了，请稍后再试");
            return ResponseEntity.status(500).body(errorResult);
        }
    }
}