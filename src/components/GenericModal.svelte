<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let isOpen = false;
  export let title = '';

  function close() {
    dispatch('close');
  }
</script>

<div class="modal" class:open={isOpen}>
  <div class="modal-content rounded-lg">
    <div class="modal-header flex">
      <h2>{title}</h2>
      <span on:click={close} class="hover:font-bold hover:cursor-pointer" role="button" tabindex="0" on:keydown={console.log('Woo!')}>X</span>
    </div>
    <div class="modal-body">
      <slot name="body"></slot>
    </div>
  </div>
</div>

<style>
  .modal {
    display: none;
    position: fixed;
    z-index: 1;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(0,0,0,0.4);
    font-family: Arial, Helvetica, sans-serif;
  }

  .modal-content {
    background-color: #fefefe;
    margin: 15% auto;
    padding: 20px;
    border: 1px solid #888;
    max-width: 80%;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .modal.open {
    display: block;
  }
</style>