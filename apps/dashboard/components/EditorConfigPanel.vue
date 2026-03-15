<template>
  <aside class="editor-config-panel flex h-full w-full flex-col bg-white">
    <div v-if="selectedNodeDef" class="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div class="flex shrink-0 items-center justify-between border-b border-surface-200 px-4 py-2.5">
        <h2 class="truncate text-sm font-semibold text-surface-900">{{ selectedNodeDef.name }}</h2>
        <button
          type="button"
          class="shrink-0 rounded-lg p-1.5 text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-700"
          title="Deselect"
          @click="$emit('deselect')"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="flex-1 overflow-y-auto p-4">
        <div class="space-y-4">
          <div v-for="(field, key) in selectedNodeDef.schema" :key="key" class="space-y-1.5">
            <label class="block text-xs font-medium uppercase tracking-wider text-surface-500">
              {{ field.label || key }}
              <span v-if="field.required" class="text-red-500">*</span>
            </label>
            <!-- String -->
            <input
              v-if="field.type === 'string' && !(field.typeOptions?.rows > 1) && !field.typeOptions?.password"
              :value="getVal(key)"
              type="text"
              class="input-base w-full"
              :placeholder="field.placeholder || field.label"
              @input="setVal(key, $event.target.value)"
            />
            <!-- Password -->
            <input
              v-else-if="field.type === 'string' && field.typeOptions?.password"
              :value="getVal(key)"
              type="password"
              class="input-base w-full"
              :placeholder="field.placeholder || field.label"
              autocomplete="off"
              @input="setVal(key, $event.target.value)"
            />
            <!-- Textarea -->
            <textarea
              v-else-if="field.type === 'string' && field.typeOptions?.rows"
              :value="getVal(key)"
              class="input-base w-full resize-y"
              :rows="field.typeOptions.rows || 3"
              :placeholder="field.placeholder || field.label"
              @input="setVal(key, $event.target.value)"
            />
            <!-- Number -->
            <input
              v-else-if="field.type === 'number'"
              :value="getVal(key)"
              type="number"
              class="input-base w-full"
              :min="field.typeOptions?.minValue"
              :max="field.typeOptions?.maxValue"
              :step="field.typeOptions?.numberPrecision ? 1 / Math.pow(10, field.typeOptions.numberPrecision) : 1"
              :placeholder="field.placeholder || field.label"
              @input="setVal(key, parseFloat($event.target.value) || $event.target.value)"
            />
            <!-- Boolean -->
            <label v-else-if="field.type === 'boolean'" class="flex cursor-pointer items-center gap-2">
              <input
                :checked="getVal(key)"
                type="checkbox"
                class="h-4 w-4 rounded border-surface-300 bg-white text-accent-500 focus:ring-accent-500/20"
                @change="setVal(key, $event.target.checked)"
              />
              <span class="text-sm text-surface-700">{{ field.description || 'Enable' }}</span>
            </label>
            <!-- Options (select) -->
            <select
              v-else-if="field.type === 'options'"
              :value="getVal(key)"
              class="input-base w-full"
              @change="setVal(key, $event.target.value)"
            >
              <option
                v-for="opt in (field.options || [])"
                :key="String(opt.value)"
                :value="opt.value"
              >
                {{ opt.name }}
              </option>
            </select>
            <!-- JSON -->
            <textarea
              v-else-if="field.type === 'json'"
              :value="formatJson(getVal(key))"
              class="input-base w-full font-mono text-sm resize-y"
              rows="5"
              :placeholder="field.placeholder || '{}'"
              @input="setJsonVal(key, $event.target.value)"
            />
            <!-- Default: string -->
            <input
              v-else
              :value="getVal(key)"
              type="text"
              class="input-base w-full"
              :placeholder="field.placeholder || field.label"
              @input="setVal(key, $event.target.value)"
            />
            <p v-if="field.hint" class="text-xs text-surface-500">{{ field.hint }}</p>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
const props = defineProps({
  selectedNodeDef: { type: Object, default: null },
  config: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['update:config', 'deselect'])

function getVal(key) {
  const v = props.config?.[key]
  if (v === undefined || v === null) return ''
  return v
}

function setVal(key, val) {
  emit('update:config', { ...props.config, [key]: val })
}

function formatJson(val) {
  if (val === '' || val === undefined || val === null) return ''
  if (typeof val === 'string') {
    try {
      return JSON.stringify(JSON.parse(val), null, 2)
    } catch {
      return val
    }
  }
  return JSON.stringify(val, null, 2)
}

function setJsonVal(key, raw) {
  let val = raw
  if (typeof raw === 'string' && raw.trim()) {
    try {
      val = JSON.parse(raw)
    } catch {
      val = raw
    }
  }
  emit('update:config', { ...props.config, [key]: val })
}
</script>
