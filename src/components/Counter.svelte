<svelte:options customElement="ps-svelte-counter" />
<script>
  // Component props
  export let type = "solid";

  let count = 0
  const increment = () => {
    count += 1
  }
</script>

<button class={type == "solid" ? "btn-solid" : "btn-outline"} on:click={increment}>
  count is {count}
</button>

<slot />

<style>
  button {
    padding: 10px;
    color: #fff;
    font-size: 17px;
    border-radius: 5px;
    border: 1px solid #ccc;
    cursor: pointer;
  }
  .btn-solid {
    background: #20c997;
    border-color: #4cae4c;
  }
  .btn-outline {
    color: #20c997;
    background: transparent;
    border-color: #20c997;
  }
</style>