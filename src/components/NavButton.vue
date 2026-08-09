<template>
  <button 
    type="button"
    class="nav-button"
    :class="[variant, { active: isActive, disabled }]"
    :disabled="disabled"
    @click="handleClick"
  >
    {{ label }}
  </button>
</template>

<script>
export default {
  name: 'NavButton',
  props: {
    label: {
      type: String,
      required: true
    },
    variant: {
      type: String,
      default: 'default',
      validator: (value) => ['default', 'delete', 'edit', 'add', 'outline'].includes(value)
    },
    isActive: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click'],
  methods: {
    handleClick(event) {
      if (event && event.preventDefault) {
        event.preventDefault()
      }
      this.$emit('click', event)
    }
  }
}
</script>

<style scoped>
.nav-button {
  padding: 10px 26px;
  border: none;
  border-radius: 14px;
  font-weight: 500;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

/* Default variant */
.nav-button.default {
  background-color: #111;
  color: #fff;
  border: 1px solid #111;
}

.nav-button.default:hover:not(:disabled) {
  background-color: #000;
  color: #fff;
}

/* Delete variant */
.nav-button.delete {
  background-color: #fff;
  color: #e53935;
  border: 2px solid #e53935;
}

.nav-button.delete:hover:not(:disabled) {
  background-color: #e53935;
  color: #fff;
}

/* Edit variant */
.nav-button.edit {
  background-color: #111;
  color: #fff;
  border: 1px solid #111;
}

.nav-button.edit:hover:not(:disabled) {
  background-color: #000;
  border-color: #000;
}

/* Outline black variant for add-photo / cover actions */
.nav-button.outline {
  background-color: transparent;
  color: #111;
  border: 1px solid #111;
}

.nav-button.outline:hover:not(:disabled) {
  background-color: #111;
  color: #fff;
}

/* Add variant */
.nav-button.add {
  background-color: #2d8a45;
  color: #fff;
  border: 1px solid #2d8a45;
}

.nav-button.add:hover:not(:disabled) {
  background-color: #236f35;
  border-color: #236f35;
}

/* Active state */
.nav-button.active:not(:disabled) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

/* Disabled state */
.nav-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>