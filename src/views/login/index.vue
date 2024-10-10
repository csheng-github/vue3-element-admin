<script setup lang="ts">
import "@/styles/login.scss";

import { LocationQuery, useRoute } from "vue-router";
import { useUserStore } from "@/store";
import AuthAPI, { type LoginData } from "@/api/auth";
import router from "@/router";
import type { FormInstance } from "element-plus";

const route = useRoute();
const userStore = useUserStore();

const loginImage = ref(
  new URL(`../../assets/images/login-image.svg`, import.meta.url).href
);

const isCapslock = ref(false);
const captchaBase64 = ref();

const loginFormRef = ref<FormInstance>();
const loginData = ref<LoginData>({
  username: "admin",
  password: "123456",
  captchaKey: "",
  captchaCode: "",
});
const loginRules = computed(() => {
  return {
    username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
    password: [
      { required: true, message: "请输入密码", trigger: "blur" },
      { min: 6, message: "密码不能少于6位", trigger: "blur" },
    ],
    captchaCode: [{ required: true, message: "请输入验证码", trigger: "blur" }],
  };
});
const loading = ref(false);

/** 获取验证码 */
function getCaptcha() {
  AuthAPI.getCaptcha().then((data) => {
    loginData.value.captchaKey = data.captchaKey;
    captchaBase64.value = data.captchaBase64;
  });
}
onMounted(() => getCaptcha());

/** 检查输入大小写 */
function checkCapslock(event: KeyboardEvent) {
  // 防止浏览器密码自动填充时报错
  if (event instanceof KeyboardEvent) {
    isCapslock.value = event.getModifierState("CapsLock");
  }
}

/** 登录表单提交 */
function handleLoginSubmit() {
  loginFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      loading.value = true;
      userStore
        .login(loginData.value)
        .then(() => {
          const { path, queryParams } = parseRedirect();
          router.push({ path: path, query: queryParams });
        })
        .catch(() => getCaptcha())
        .finally(() => (loading.value = false));
    }
  });
}

/** 解析 redirect 字符串 为 path 和  queryParams */
function parseRedirect(): {
  path: string;
  queryParams: Record<string, string>;
} {
  const query: LocationQuery = route.query;
  const redirect = (query.redirect as string) ?? "/";

  const url = new URL(redirect, window.location.origin);
  const path = url.pathname;
  const queryParams: Record<string, string> = {};

  url.searchParams.forEach((value, key) => {
    queryParams[key] = value;
  });

  return { path, queryParams };
}
</script>

<template>
  <div class="login-container">
    <div class="login-content">
      <div class="login-image">
        <el-image :src="loginImage" style="width: 210px; height: 210px" />
      </div>
      <div class="login-box">
        <el-form
          ref="loginFormRef"
          :model="loginData"
          :rules="loginRules"
          class="login-form"
        >
          <h2 class="text-xl font-medium text-center flex-center relative">
            登录
          </h2>

          <!-- 用户名 -->
          <el-form-item prop="username">
            <div class="input-wrapper">
              <el-icon class="mx-2">
                <User />
              </el-icon>
              <el-input
                ref="username"
                v-model="loginData.username"
                :placeholder="'用户名'"
                name="username"
                size="large"
                class="h-[48px]"
              />
            </div>
          </el-form-item>

          <!-- 密码 -->
          <el-tooltip
            :visible="isCapslock"
            :content="'大写锁定已打开'"
            placement="right"
          >
            <el-form-item prop="password">
              <div class="input-wrapper">
                <el-icon class="mx-2">
                  <Lock />
                </el-icon>
                <el-input
                  v-model="loginData.password"
                  placeholder="密码"
                  type="password"
                  name="password"
                  @keyup="checkCapslock"
                  @keyup.enter="handleLoginSubmit"
                  size="large"
                  class="h-[48px] pr-2"
                  show-password
                />
              </div>
            </el-form-item>
          </el-tooltip>

          <!-- 验证码 -->
          <el-form-item prop="captchaCode">
            <div class="input-wrapper">
              <svg-icon icon-class="captcha" class="mx-2" />
              <el-input
                v-model="loginData.captchaCode"
                auto-complete="off"
                size="large"
                class="flex-1"
                :placeholder="'验证码'"
                @keyup.enter="handleLoginSubmit"
              />

              <el-image
                @click="getCaptcha"
                :src="captchaBase64"
                class="captcha-image"
              />
            </div>
          </el-form-item>

          <div class="flex-x-between w-full py-1">
            <el-checkbox>记住我</el-checkbox>
            <el-link type="primary" href="/forget-password">忘记密码</el-link>
          </div>

          <!-- 登录按钮 -->
          <el-button
            :loading="loading"
            type="primary"
            size="large"
            class="w-full"
            @click.prevent="handleLoginSubmit"
          >
            登录
          </el-button>
        </el-form>
      </div>
    </div>
  </div>
</template>
