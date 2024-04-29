<script>
  import { onMount } from 'svelte';

  import dev_menu from '../data/ps_nav.json';

  let menuJSON;
  let pluginNames = [];
  let pluginMap = {};
  let selectedPlugin = 'All'; // Default selection

  const isProduction = !import.meta.env.DEV;

  // Fetch menu data on mount
  onMount(async () => {

    if (isProduction) {
      processJSON(dev_menu)
    } else {
      const response = await fetch('/ws/cpm/tree?maxDepth=100&path=%2F');
      menuJSON = await response.json();
      processJSON(menuJSON.folder);
    }
    // Add "All" option to pluginNames
    pluginNames = ['All', ...pluginNames];
  });

  // Process JSON data
  function processJSON(data) {
  if (data.pages) {
    data.pages.forEach(page => {
      const pluginName = page.pluginName || "Other";
      if (!pluginNames.includes(pluginName)) {
        pluginNames.push(pluginName);
        pluginMap[pluginName] = [];
      }
      pluginMap[pluginName].push(`${data.path}/${page.text}`);
    });
  }
  if (data.subFolders) {
    data.subFolders.forEach(folder => {
      processJSON(folder);
    });
  }
}

  // Filter menu items
  $: filteredItems = selectedPlugin === 'All'
    ? menuJSON.folder.subFolders
    : menuJSON.folder.subFolders.map(folder => ({
        ...folder,
        pages: folder.pages.filter(page => page.pluginName === selectedPlugin),
        subFolders: filterSubfolders(folder.subFolders)
      }));

  // Recursive function to filter subfolders
  function filterSubfolders(subfolders) {
    if (!subfolders || subfolders.length === 0) return [];
    return subfolders.map(folder => ({
      ...folder,
      pages: folder.pages.filter(page => page.pluginName === selectedPlugin),
      subFolders: filterSubfolders(folder.subFolders)
    }));
  }
</script>

<select bind:value={selectedPlugin}>
  {#each pluginNames as name}
    <option value={name}>{name}</option>
  {/each}
</select>

{#each filteredItems as folder}
  <ul>
    <li>
      <a>{folder.text}</a>
      {#if folder.subFolders.length > 0}
        <Tree {folder} />
      {/if}
      {#each folder.pages as page}
        <li class:hidden={page.pluginName !== selectedPlugin}>
          <a>{page.text}</a>
        </li>
      {/each}
    </li>
  </ul>
{/each}

<!-- Recursive Tree component -->
<svelte:component this={Tree} let:folder>
  <ul>
    {#each folder.subFolders as subfolder}
      <li>
        <a>{subfolder.text}</a>
        {#if subfolder.subFolders.length > 0}
          <Tree {subfolder} />
        {/if}
        {#each subfolder.pages as page}
          <li class:hidden={page.pluginName !== selectedPlugin}>
            <a>{page.text}</a>
          </li>
        {/each}
      </li>
    {/each}
  </ul>
</svelte:component>

<style>
  .hidden {
    display: none;
  }
</style>