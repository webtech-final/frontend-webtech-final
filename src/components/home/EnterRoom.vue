<template>
    <div class="flex shadow-md">
        <div
            class="
				grid-cols-1
				p-10
				border-2
				bg-gradient-to-b
				from-indigo-50
				to-purple-300
			"
        >
            <div class="text-center text-3xl m-2 mx-auto place-self-center">
                <a class="text-center w-full"
                    >{{ msg === 'JOIN' ? 'PLEASE ENTER ROOM PIN BELOW' : 'HERE IS YOUR ROOM PIN' }}
                </a>
            </div>
            <div class="my-7 relative">
                <input
                    class="
						input
						border border-gray-400
						appearance-none
						rounded
						w-full
						px-3
						py-3
						pt-5
						pb-2
						focus
						focus:border-indigo-600
						focus:outline-none
						active:outline-none
						active:border-indigo-600
					"
                    :disabled="msg === 'CREATE' ? true : false"
                    id=""
                    type="text"
                    autofocus
                    v-model="roomData.pin"
                />
                <label
                    for="email"
                    class="
						label
						absolute
						mb-0
						-mt-2
						pt-4
						pl-3
						leading-tighter
						text-gray-400 text-base
						mt-2
						cursor-text
					"
                    :hidden="msg === 'CREATE' ? true : false"
                    >Room Pin</label
                >
            </div>
            <div class="flex justify-center">
                <button
                    v-if="msg !== 'JOIN' && isAuthen()"
                    class="
                        mr-3
						items-center
						justify-center
						py-3
						px-6
						text-white
						rounded-lg
						shadow-lg
						block
						md:inline-block
					"
                    :class="msg === 'JOIN' ? 'bg-blue-400' : 'bg-red-400'"
                    @click="handleSendMsg"
                >
                    Send Pin to Chat
                </button>
                <button
                    class="
						items-center
						justify-center
						py-3
						px-6
						text-white
						rounded-lg
						shadow-lg
						block
						md:inline-block
					"
                    :class="msg === 'JOIN' ? 'bg-blue-400' : 'bg-red-400'"
                    @click="handleBtn"
                >
                    {{ msg }}
                </button>
            </div>
        </div>
    </div>
</template>
<script>
import GameStore from '../../store/GameStore';
import AuthUser from '../../store/authUser';
import Chat from '../../services/chat';

export default {
    name: 'EnterRoom',
    props: ['msg', 'pin'],
    data() {
        return {
            socket: GameStore.getters.getSocket,
            roomData: {
                mode: this.msg,
                pin: this.pin,
            },
        };
    },
    methods: {
        handleBtn() {
            this.$emit('onHome', { event: this.msg, pin: this.roomData.pin });
        },

        handleSendMsg() {
            let username = AuthUser.getters.user.name;
            Chat.chat(`${username}: Join my room --> ${this.roomData.pin}`);
        },

        isAuthen() {
            return AuthUser.getters.isAuthen;
        },

        socketInit() {
            this.socket.on('gameCode', gameCode => {
                this.roomData.pin = gameCode;
                GameStore.commit('setGameCode', gameCode);
                this.setPin();
            });
        },

        setPin() {
            this.msg === 'CREATE' ? this.roomData.pin : (this.roomData.pin = '');
        },
    },

    created() {
        this.socketInit();
    },
};
</script>
<style lang="scss" scoped></style>
