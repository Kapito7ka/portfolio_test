<template>
  <button 
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
      validator: (value) => ['default', 'delete', 'edit', 'add'].includes(value)
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
      this.$emit('click', event);
    }
  }
}
</script>

<style scoped>
.nav-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

/* Default variant */
.nav-button.default {
  background-color: #f3f3f3;
  color: #333;
}

.nav-button.default:hover:not(:disabled) {
  background-color: #e0e0e0;
}

/* Delete variant */
.nav-button.delete {
  background-color: #b42318;
  color: #fff;
}

.nav-button.delete:hover:not(:disabled) {
  background-color: #8b1a13;
}

/* Edit variant */
.nav-button.edit {
  background-color: #ff9800;
  color: #fff;
}

.nav-button.edit:hover:not(:disabled) {
  background-color: #e68900;
}

/* Add variant */
.nav-button.add {
  background-color: #42b883;
  color: #fff;
}

.nav-button.add:hover:not(:disabled) {
  background-color: #359670;
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