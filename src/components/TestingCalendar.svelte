<script>
  import { writable } from 'svelte/store';
  import testing_calendar from '../assets/testing_calendar_days.json';

  // Stores for data, loading state, and error
  const data = writable([]);
  const loading = writable(false);
  const error = writable(null);

  // Get date and report name from query string or default values
  const urlParams = new URLSearchParams(window.location.search);
  let date = urlParams.get('date') ?? new Date().toISOString().split('T')[0];
  let report = urlParams.get('report') ?? 'No Report Specified';

  // Function to fetch data
  async function fetchData() {
    loading.set(true);
    error.set(null);
    try {
      const response = await fetch(`/admin/te-tech/ps-pennsylvania/testing_calendar.js?date=${date}&report=${report}`);
      const newData = await response.json();
      data.set(newData);
    } catch (err) {
      error.set(err);
      data.set([]); // Reset data on error
    } finally {
      loading.set(false);
    }
  }

  // Initial data fetch
  fetchData(); 
</script>

<div id="report">
  {#if $loading}
    <p>Loading data...</p>
  {:else if $error}
    <p>Error: {$error.message}</p>
  {:else if $data.length > 0}
    <h1>Testing Calendar - {report}</h1>
    <table id="calendar" class="table-auto border border-slate-950">
      <thead class="bg-gray-50">
        <tr>
          <th class="sticky top-0 bg-white">Cal Date</th>
          <th class="sticky top-0 bg-white">Day Number</th>
          <th class="sticky top-0 bg-white">% Before</th>
          <th class="sticky top-0 bg-white">% After</th>
        </tr>
      </thead>
      <tbody>
        {#each $data as item}
          <tr>
            <td class="text-center">{item.CAL_DATE}</td>
            <td class="text-center">{item.DAY_NUMBER}</td>
            <td class="text-center">{item.PERCENT_BEFORE}</td>
            <td class="text-center">{item.PERCENT_AFTER}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    <p>No data available for the selected date and report.</p>
  {/if}
</div>

<style>
  #report {
    font-family: Arial, Helvetica, sans-serif;
  }
</style>