<svelte:options customElement="ps-svelte-career-readiness" />
<script>
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import dev_data from '../data/career_readiness.json';

  const isProduction = !import.meta.env.DEV;

  // Stores for data, loading state, and error
  const data = writable([]);
  let filteredData = writable([]);
  const gradYears = writable([]);
  const selectedGradYear = writable(2025);
  const loading = writable(false);
  const error = writable(null);

  // Function to fetch data
  async function fetchData() {
    loading.set(true);
    error.set(null);

    let selectedGradYearValue;
    selectedGradYear.subscribe(value => {
      selectedGradYearValue = value;
    })();

    try {
      if (!isProduction) {
        // Use local data in development
        data.set(dev_data);
        filteredData.set(dev_data.filter((item) => item.SCHED_YEAROFGRADUATION == selectedGradYearValue));

        // console.log('dev_data', dev_data);
        return;
      }

      let pathParts = window.location.pathname.split('/');
      const portal = pathParts[1];

      const response = await fetch(`/${portal}/ps-svelte/json/career_readiness.json`);
      const newData = await response.json();
      data.set(newData);
      filteredData.set(newData);

    } catch (err) {
      error.set(err);
      data.set([]); // Reset data on error
    } finally {
      loading.set(false);
    }
  }

  // Define a filtered data store based on the date
  filteredData.subscribe((value) => {
    return value
  }); // Subscribe to update on changes

  // Function to filter data based on date
  let dataValue = [];
  data.subscribe(value => {
    dataValue = value;
  });

  let filteredDataValue = [];
  filteredData.subscribe(value => {
    filteredDataValue = value;
  });

  function filterData(target) {
    if (!target) return;
    filteredData.set(dataValue.filter((item) => item.SCHED_YEAROFGRADUATION === parseInt(target)));
  }

  // Call filter function on data change
  data.subscribe((value) => filterData(selectedGradYear));

  function updateFilter(event) {
    selectedGradYear.set(event.target.value);
    data.subscribe((value) => filterData(event.target.value));
  }

  function getGradYears() {
    let gradYears = [];
    dataValue.forEach(item => {
      if (!gradYears.includes(item.SCHED_YEAROFGRADUATION)) {
        gradYears.push(item.SCHED_YEAROFGRADUATION);
      }
    });
    // Sort the grad years DESC
    gradYears.sort((a, b) => b - a);
    return gradYears;
  }

  onMount(async () => {
    await fetchData();
    gradYears.set(getGradYears());
  });

</script>

<div class="container mx-auto p-4 report">
  <div class="flex flex-initial justify-between pb-4">
    <select class="p-2 border border-gray-400 rounded" on:change={updateFilter}>
      <option value="">Select a Graduation Year</option>
      {#each $gradYears as y}
        <option value={y}>{y}</option>
      {/each}
    </select>
  </div>
  {#if $loading}
    <p class="text-center text-gray-500">Loading data...</p>
  {:else if $error}
    <p class="text-center text-red-500">Error: {$error.message}</p>
  {:else if $filteredData.length > 0}
    <table id="data" class="table-auto border-collapse border border-gray-400">
      <thead>
        <tr>
          <th class="sticky top-0 px-4 py-2 bg-gray-100 border border-gray-950">Student</th>
          <th class="sticky top-0 px-4 py-2 bg-gray-100 border border-gray-950">Email</th>
          <th class="sticky top-0 px-4 py-2 bg-gray-100 border border-gray-950">Student Number</th>
          <th class="sticky top-0 px-4 py-2 bg-gray-100 border border-gray-950">Grad Year</th>
          {#each Array(20).fill() as _, i}
            <th class="sticky top-0 px-4 py-2 bg-gray-100 border border-gray-950">Artifact {i+1}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each $filteredData as item}
          
          <tr>
            <td class="px-4 py-2 border border-gray-950">{item.STUDENT}</td>
            <td class="px-4 py-2 border border-gray-950"><a target="_blank" href="mailto:{item.STUDENT_EMAIL}">{item.STUDENT_EMAIL}</a></td>
            <td class="px-4 py-2 border border-gray-950 text-center">{item.STUDENT_NUMBER}</td>
            <td class="px-4 py-2 border border-gray-950 text-center">{item.SCHED_YEAROFGRADUATION}</td>
            {#each item.ARTIFACTS.sort((a, b) => new Date(a) - new Date(b)) as artifact, i}
              <td class="px-4 py-2 border border-gray-950 text-center">{artifact ?? ''}</td>
            {/each}
            {#each Array(20 - item.ARTIFACTS.length).fill() as _, i}
              <td class="px-4 py-2 border border-gray-950 text-center">&nbsp;</td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    <p class="text-center text-gray-500">No data available for the selected graduation year.</p>
  {/if}

</div>

<style>
  .report {
    font-family: Arial, Helvetica, sans-serif;
  }

  th, td {
    border: 1px solid;
  }

  tr:hover {
    @apply bg-gray-200 font-semibold transition duration-300 ease-in-out;
  }
</style>