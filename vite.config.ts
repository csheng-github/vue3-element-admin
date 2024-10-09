import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { UserConfig, ConfigEnv, loadEnv, defineConfig } from "vite";
import { resolve } from "path";

// 按需自动导入API（ref，reactive,watch,computed 等API）
import AutoImport from "unplugin-auto-import/vite";
// 按需自动导入组件（指定目录下的自定义组件）
import Components from "unplugin-vue-components/vite";
// 按需自动导入组件（Element Plus 组件）
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

// 引入整合 SVG 图标插件
import { createSvgIconsPlugin } from "vite-plugin-svg-icons";
// 引入UnoCSS
import UnoCSS from "unocss/vite";

import mockDevServerPlugin from "vite-plugin-mock-dev-server";

import {
  name,
  version,
  engines,
  dependencies,
  devDependencies,
} from "./package.json";

/** @see  https://devtools-next.vuejs.org  */
import VueDevTools from "vite-plugin-vue-devtools";

/** 平台的名称、版本、运行所需的`node`版本、依赖、构建时间的类型提示 */
const __APP_INFO__ = {
  pkg: { name, version, engines, dependencies, devDependencies },
  buildTimestamp: Date.now(),
};

const pathSrc = resolve(__dirname, "src");
/**  Vite配置 @see https://cn.vitejs.dev/config */
export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  const env = loadEnv(mode, process.cwd());
  return {
    resolve: {
      // 路径别名
      alias: {
        "@": pathSrc,
      },
    },
    css: {
      // CSS 预处理器
      preprocessorOptions: {
        // 定义全局 SCSS 变量
        scss: {
          javascriptEnabled: true,
          additionalData: `
            @use "@/styles/variables.scss" as *;
          `,
        },
      },
    },
    server: {
      // 允许IP访问
      host: "0.0.0.0",
      // 应用端口 (默认:3000)
      port: Number(env.VITE_APP_PORT),
      // 运行是否自动打开浏览器
      open: true,
      // 反向代理解决跨域
      proxy: {
        [env.VITE_APP_BASE_API]: {
          target: env.VITE_APP_API_URL,
          changeOrigin: true,
          rewrite: (path) =>
            path.replace(new RegExp("^" + env.VITE_APP_BASE_API), ""),
        },
      },
    },
    plugins: [
      vue(),
      // jsx、tsx语法支持
      vueJsx(),
      // MOCK 服务
      env.VITE_MOCK_DEV_SERVER === "true" ? mockDevServerPlugin() : null,
      // UnoCSS 配置
      UnoCSS({ hmrTopLevelAwait: false }),
      AutoImport({
        // 自动导入 Vue 相关函数，如：ref, reactive, toRef 等
        imports: ["vue", "@vueuse/core", "pinia", "vue-router", "vue-i18n"],
        // 自动导入 Element Plus 相关函数，如：ElMessage, ElMessageBox... (带样式)
        resolvers: [ElementPlusResolver({ importStyle: "sass" })],
        // 生成 eslint 规则
        eslintrc: {
          enabled: false, // 建议生成之后设置 false
          filepath: "./.eslintrc-auto-import.json", // 指定自动导入函数 eslint 规则的文件
          globalsPropValue: true,
        },
        // 是否在 vue 模板中自动导入
        vueTemplate: true,
        // 指定自动导入函数TS类型声明文件路径 (false:关闭自动生成)
        dts: false,
        // dts: "src/types/auto-imports.d.ts",
      }),
      Components({
        // 指定自定义组件位置(默认:src/components)
        dirs: ["src/components", "src/**/components"],
        // 自动导入 Element Plus 组件
        resolvers: [ElementPlusResolver({ importStyle: "sass" })],
        // 指定自动导入组件TS类型声明文件路径 (false:关闭自动生成)
        dts: false,
        // dts: "src/types/components.d.ts",
      }),
      createSvgIconsPlugin({
        // 指定需要缓存的图标文件夹
        iconDirs: [resolve(pathSrc, "assets/icons")],
        // 指定symbolId格式
        symbolId: "icon-[dir]-[name]",
      }),
      /* VueDevTools({
        openInEditorHost: `http://localhost:${env.VITE_APP_PORT}`,
      }), */
    ],
    // 预加载项目必需的组件
    optimizeDeps: {
      include: [
        "vue",
        "vue-router",
        "pinia",
        "axios",
        "@vueuse/core",
        "sortablejs",
        "exceljs",
        "path-to-regexp",
        "echarts",
        "@wangeditor/editor",
        "@wangeditor/editor-for-vue",
        "vue-i18n",
        "path-browserify",
        "element-plus/es/components/form/style/index",
        "element-plus/es/components/form-item/style/index",
        "element-plus/es/components/button/style/index",
        "element-plus/es/components/input/style/index",
        "element-plus/es/components/input-number/style/index",
        "element-plus/es/components/switch/style/index",
        "element-plus/es/components/upload/style/index",
        "element-plus/es/components/menu/style/index",
        "element-plus/es/components/col/style/index",
        "element-plus/es/components/icon/style/index",
        "element-plus/es/components/row/style/index",
        "element-plus/es/components/tag/style/index",
        "element-plus/es/components/dialog/style/index",
        "element-plus/es/components/loading/style/index",
        "element-plus/es/components/radio/style/index",
        "element-plus/es/components/radio-group/style/index",
        "element-plus/es/components/popover/style/index",
        "element-plus/es/components/scrollbar/style/index",
        "element-plus/es/components/tooltip/style/index",
        "element-plus/es/components/dropdown/style/index",
        "element-plus/es/components/dropdown-menu/style/index",
        "element-plus/es/components/dropdown-item/style/index",
        "element-plus/es/components/sub-menu/style/index",
        "element-plus/es/components/menu-item/style/index",
        "element-plus/es/components/divider/style/index",
        "element-plus/es/components/card/style/index",
        "element-plus/es/components/link/style/index",
        "element-plus/es/components/breadcrumb/style/index",
        "element-plus/es/components/breadcrumb-item/style/index",
        "element-plus/es/components/table/style/index",
        "element-plus/es/components/tree-select/style/index",
        "element-plus/es/components/table-column/style/index",
        "element-plus/es/components/select/style/index",
        "element-plus/es/components/option/style/index",
        "element-plus/es/components/pagination/style/index",
        "element-plus/es/components/tree/style/index",
        "element-plus/es/components/alert/style/index",
        "element-plus/es/components/radio-button/style/index",
        "element-plus/es/components/checkbox-group/style/index",
        "element-plus/es/components/checkbox/style/index",
        "element-plus/es/components/tabs/style/index",
        "element-plus/es/components/tab-pane/style/index",
        "element-plus/es/components/rate/style/index",
        "element-plus/es/components/date-picker/style/index",
        "element-plus/es/components/notification/style/index",
        "element-plus/es/components/image/style/index",
        "element-plus/es/components/statistic/style/index",
        "element-plus/es/components/watermark/style/index",
        "element-plus/es/components/config-provider/style/index",
        "element-plus/es/components/text/style/index",
        "element-plus/es/components/drawer/style/index",
        "element-plus/es/components/color-picker/style/index",
        "element-plus/es/components/backtop/style/index",
        "element-plus/es/components/message-box/style/index",
        "element-plus/es/components/skeleton/style/index",
        "element-plus/es/components/skeleton/style/index",
        "element-plus/es/components/skeleton-item/style/index",
        "element-plus/es/components/badge/style/index",
        "element-plus/es/components/steps/style/index",
        "element-plus/es/components/step/style/index",
        "element-plus/es/components/avatar/style/index",
        "element-plus/es/components/descriptions/style/index",
        "element-plus/es/components/descriptions-item/style/index",
        "element-plus/es/components/checkbox-group/style/index",
        "element-plus/es/components/progress/style/index",
        "element-plus/es/components/image-viewer/style/index",
        "element-plus/es/components/empty/style/index",
      ],
    },
    // 构建配置
    build: {
      chunkSizeWarningLimit: 2000, // 消除打包大小超过500kb警告
      minify: "terser", // Vite 2.6.x 以上需要配置 minify: "terser", terserOptions 才能生效
      terserOptions: {
        compress: {
          keep_infinity: true, // 防止 Infinity 被压缩成 1/0，这可能会导致 Chrome 上的性能问题
          drop_console: true, // 生产环境去除 console
          drop_debugger: true, // 生产环境去除 debugger
        },
        format: {
          comments: false, // 删除注释
        },
      },
      rollupOptions: {
        output: {
          // manualChunks: {
          //   "vue-i18n": ["vue-i18n"],
          // },
          // 用于从入口点创建的块的打包输出格式[name]表示文件名,[hash]表示该文件内容hash值
          entryFileNames: "js/[name].[hash].js",
          // 用于命名代码拆分时创建的共享块的输出命名
          chunkFileNames: "js/[name].[hash].js",
          // 用于输出静态资源的命名，[ext]表示文件扩展名
          assetFileNames: (assetInfo: any) => {
            const info = assetInfo.name.split(".");
            let extType = info[info.length - 1];
            // console.log('文件信息', assetInfo.name)
            if (
              /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)
            ) {
              extType = "media";
            } else if (/\.(png|jpe?g|gif|svg)(\?.*)?$/.test(assetInfo.name)) {
              extType = "img";
            } else if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name)) {
              extType = "fonts";
            }
            return `${extType}/[name].[hash].[ext]`;
          },
        },
      },
    },
    define: {
      __APP_INFO__: JSON.stringify(__APP_INFO__),
    },
  };
});
