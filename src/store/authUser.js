import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";

Vue.use(Vuex);

let auth_key = "auth_user";
let auth = JSON.parse(localStorage.getItem(auth_key));
let api_endpoint = process.env.VUE_APP_ENDPOINT || "http://localhost:8000";

export default new Vuex.Store({
    state: {
        user: auth ? auth.data.user : "",
        jwt: auth ? auth.data.access_token : "",
        isAuthen: auth ? true : false,
        header: auth ? { headers: { Authorization: `Bearer ${auth.data.access_token}` } } : "",
    },
    mutations: {
        loginSuccess(state, res) {
            state.user = res.user;
            state.jwt = res.access_token;
            state.isAuthen = true;
            state.header = { headers: { Authorization: `Bearer ${res.access_token}` } };
        },
        logoutSuccess(state) {
            state.user = "";
            state.jwt = "";
            state.isAuthen = false;
            state.header = "";
        },
        getPoint(state, res) {
            state.user.point = res;
        },
        usePoint(state, res) {
            state.user.point = res;
        },
        updateProfilePic(state, res) {
            state.user.image = res;
        },
        updateName(state, res) {
            state.user.name = res;
        },
        setUser(state, res) {
            state.user = res;
        },
    },
    actions: {
        async login({ commit }, { email, password }) {
            let url = `${api_endpoint}/api/auth/login`;
            let body = {
                email: email,
                password: password,
            };
            try {
                let res = await axios.post(url, body);
                if (res.data.user.role === "admin") {
                    return res.data.user.role;
                }
                commit("loginSuccess", res.data);
                localStorage.setItem(auth_key, JSON.stringify(res));
                return res;
            } catch (e) {
                if (e.response.status === 401) {
                    return e.response;
                } else if (e.response.status === 422) {
                    return e.response;
                }
            }
        },

        // รอดูว่าตอนสมัครเสร็จได้ jwt ไหม
        async register({ commit }, payload) {
            try {
                let url = `${api_endpoint}/api/auth/register`;
                let body = payload;
                let res = await axios.post(url, body);
                commit("logoutSuccess");
                return res;
            } catch (e) {
                if (e.response.status === 400) {
                    return e.response;
                }
            }
        },
        async logout({ commit }) {
            let url = `${api_endpoint}/api/auth/logout`;
            let header = this.state.header;
            let res = null;
            try {
                res = await axios.post(url, null, header);
            } catch (err) {
                console.log("logout error");
            }
            localStorage.removeItem(auth_key);
            commit("logoutSuccess");
            return res;
        },

        async getPoint({ commit }, payload) {
            let url = `${api_endpoint}/api/auth/getPoint/${payload.id}`;
            let body = {
                point: payload.point,
            };
            let header = this.state.header;
            let res = await axios.put(url, body, header);
            commit("getPoint", res.data);
        },

        async usePoint({ commit }, payload) {
            let url = `${api_endpoint}/api/auth/usePoint/${payload.user_id}`;
            let body = {
                point: payload.point,
            };
            let header = this.state.header;
            let res = await axios.put(url, body, header);
            commit("getPoint", res.data);
        },
        async updateProfilePic({ commit }, payload) {
            let url = `${api_endpoint}/api/auth/uploadProfile`;
            let formData = new FormData();
            formData.append("selectedImage", payload.image);
            formData.append("id", this.getters.user.id);
            let header = this.state.header;
            try {
                let res = await axios.post(url, formData, header);
                commit("updateProfilePic", res.data.path);
                return res.data.status;
            } catch (error) {
                return error.response.data.error[0];
            }
        },
        async updateName({ commit }, payload) {
            let url = `${api_endpoint}/api/auth/updateName`;
            let body = {
                id: this.getters.user.id,
                new_name: payload.new_name,
            };
            let header = this.state.header;
            try {
                let res = await axios.put(url, body, header);
                commit("updateName", res.data);
                return "success";
            } catch (error) {
                return error.response.data.new_name[0];
            }
        },
        async fetchUser({ commit }) {
            let url = `${api_endpoint}/api/auth/me`;
            let header = this.state.header;
            try {
                let res = await axios.post(url, null, header);
                commit("setUser", res.data);
                return res.data;
            } catch (error) {
                this.dispatch("logout");
                return "fetch user fail";
            }
        },
    },
    modules: {},
    getters: {
        user: (state) => state.user,
        jwt: (state) => state.jwt,
        isAuthen: (state) => state.isAuthen,
        header: (state) => state.header,
    },
});
