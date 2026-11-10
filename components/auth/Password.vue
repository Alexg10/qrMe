<script setup lang="ts">
/* Champ mot de passe avec bouton œil pour l'afficher en clair. Les attributs (id, autocomplete, minlength…) vont sur l'input. */
import { Eye, EyeOff } from "lucide-vue-next";

defineOptions({ inheritAttrs: false });
const model = defineModel<string>({ default: "" });
const shown = ref(false);
</script>

<template>
  <div class="pw">
    <input v-bind="$attrs" v-model="model" :type="shown ? 'text' : 'password'" autocapitalize="off" spellcheck="false" >
    <button
      type="button"
      class="eye"
      :aria-label="shown ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
      :aria-pressed="shown"
      @click="shown = !shown"
    >
      <component :is="shown ? EyeOff : Eye" :size="18" aria-hidden="true" />
    </button>
  </div>
</template>

<style scoped>
.pw { position: relative; }
.pw input { padding-right: 40px; }
.eye {
  position: absolute; right: 0; bottom: 4px; width: 36px; height: 32px; display: grid; place-content: center;
  border: 0; background: transparent; color: var(--mute); cursor: pointer;
}
.eye:hover, .eye:focus-visible { color: var(--paper); }
.eye:focus-visible { outline: 2px solid var(--paper); outline-offset: 1px; }
</style>
