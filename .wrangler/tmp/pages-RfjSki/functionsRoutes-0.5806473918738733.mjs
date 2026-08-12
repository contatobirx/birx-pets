import { onRequestGet as __api_ativar_js_onRequestGet } from "C:\\Users\\ORBITECH\\Desktop\\orbitek-pets-v2\\functions\\api\\ativar.js"
import { onRequestPost as __api_ativar_js_onRequestPost } from "C:\\Users\\ORBITECH\\Desktop\\orbitek-pets-v2\\functions\\api\\ativar.js"
import { onRequestGet as __api_leituras_js_onRequestGet } from "C:\\Users\\ORBITECH\\Desktop\\orbitek-pets-v2\\functions\\api\\leituras.js"
import { onRequestGet as __api_login_solicitar_js_onRequestGet } from "C:\\Users\\ORBITECH\\Desktop\\orbitek-pets-v2\\functions\\api\\login-solicitar.js"
import { onRequestPost as __api_login_solicitar_js_onRequestPost } from "C:\\Users\\ORBITECH\\Desktop\\orbitek-pets-v2\\functions\\api\\login-solicitar.js"
import { onRequestGet as __api_login_verificar_js_onRequestGet } from "C:\\Users\\ORBITECH\\Desktop\\orbitek-pets-v2\\functions\\api\\login-verificar.js"
import { onRequestPost as __api_login_verificar_js_onRequestPost } from "C:\\Users\\ORBITECH\\Desktop\\orbitek-pets-v2\\functions\\api\\login-verificar.js"
import { onRequestGet as __api_logout_js_onRequestGet } from "C:\\Users\\ORBITECH\\Desktop\\orbitek-pets-v2\\functions\\api\\logout.js"
import { onRequestPost as __api_logout_js_onRequestPost } from "C:\\Users\\ORBITECH\\Desktop\\orbitek-pets-v2\\functions\\api\\logout.js"
import { onRequestGet as __api_pet_js_onRequestGet } from "C:\\Users\\ORBITECH\\Desktop\\orbitek-pets-v2\\functions\\api\\pet.js"
import { onRequestPost as __api_pet_js_onRequestPost } from "C:\\Users\\ORBITECH\\Desktop\\orbitek-pets-v2\\functions\\api\\pet.js"
import { onRequestGet as __api_tag_js_onRequestGet } from "C:\\Users\\ORBITECH\\Desktop\\orbitek-pets-v2\\functions\\api\\tag.js"
import { onRequestGet as __api_tutor_js_onRequestGet } from "C:\\Users\\ORBITECH\\Desktop\\orbitek-pets-v2\\functions\\api\\tutor.js"
import { onRequestGet as __api_upload_js_onRequestGet } from "C:\\Users\\ORBITECH\\Desktop\\orbitek-pets-v2\\functions\\api\\upload.js"
import { onRequestPost as __api_upload_js_onRequestPost } from "C:\\Users\\ORBITECH\\Desktop\\orbitek-pets-v2\\functions\\api\\upload.js"

export const routes = [
    {
      routePath: "/api/ativar",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_ativar_js_onRequestGet],
    },
  {
      routePath: "/api/ativar",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_ativar_js_onRequestPost],
    },
  {
      routePath: "/api/leituras",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_leituras_js_onRequestGet],
    },
  {
      routePath: "/api/login-solicitar",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_login_solicitar_js_onRequestGet],
    },
  {
      routePath: "/api/login-solicitar",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_login_solicitar_js_onRequestPost],
    },
  {
      routePath: "/api/login-verificar",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_login_verificar_js_onRequestGet],
    },
  {
      routePath: "/api/login-verificar",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_login_verificar_js_onRequestPost],
    },
  {
      routePath: "/api/logout",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_logout_js_onRequestGet],
    },
  {
      routePath: "/api/logout",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_logout_js_onRequestPost],
    },
  {
      routePath: "/api/pet",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_pet_js_onRequestGet],
    },
  {
      routePath: "/api/pet",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_pet_js_onRequestPost],
    },
  {
      routePath: "/api/tag",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_tag_js_onRequestGet],
    },
  {
      routePath: "/api/tutor",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_tutor_js_onRequestGet],
    },
  {
      routePath: "/api/upload",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_upload_js_onRequestGet],
    },
  {
      routePath: "/api/upload",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_upload_js_onRequestPost],
    },
  ]