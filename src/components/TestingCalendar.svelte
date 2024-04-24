<svelte:options customElement="ps-svelte-testing-calendar" />
<script>
  import { writable, get } from 'svelte/store';
  import testing_calendar from '../data/testing_calendar_days.json';
  import testing_calendar_tests from '../data/testing_calendar_tests.json';

  const isProduction = !import.meta.env.DEV;

  // Stores for data, loading state, and error
  const data = writable([]);
  const tests = writable([]);
  const selectedTest = writable('');
  const loading = writable(false);
  const error = writable(null);

  // Get date and report name from query string or default values
  const urlParams = new URLSearchParams(window.location.search);
  let date = urlParams.get('date') ?? new Date('2099-01-01').toISOString().split('T')[0];
  let report = urlParams.get('report') ?? '';

  // Function to fetch data
  async function fetchData() {
    loading.set(true);
    error.set(null);
    try {
      if (!isProduction) {
        // Use local data in development
        data.set(testing_calendar);
        tests.set(testing_calendar_tests);
        return;
      }

      let pathParts = window.location.pathname.split('/');
      const portal = pathParts[1];

      const response = await fetch(`/${portal}/ps-svelte/json/testing_calendar_days.json`);
      const newData = await response.json();
      data.set(newData);

      const responseTests = await fetch(`/${portal}/ps-svelte/json/testing_calendar_tests.json`);
      const newTests = await responseTests.json();
      tests.set(newTests);
    } catch (err) {
      error.set(err);
      data.set([]); // Reset data on error
    } finally {
      loading.set(false);
    }
  }

  // Initial data fetch
  fetchData();

  // Define a filtered data store based on the date
  let filteredData = writable([]);
  filteredData.subscribe((value) => {
    return value
  }); // Subscribe to update on changes

  // Function to filter data based on date
  function filterDataByDate(targetDate) {
    let currentData = get(data);
    let nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    filteredData.set(currentData.filter((item) => new Date(item.DATE_VALUE) < nextDay));

    // Add percentage before and after
    filteredData.update((value) => {
      value.forEach((item, index) => {
        item.PERCENT_BEFORE = Math.round(((index) / value.length * 100));
        item.PERCENT_AFTER = Math.round((value.length - (index + 1)) / value.length * 100);

        if (index === value.length - 1) {
          item.PERCENT_BEFORE = 100;
        }
      });

      return value;
    });
  }

  // Call filter function on data change
  data.subscribe((value) => filterDataByDate(date));

  function formatDate(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year}`;
  }

  function updateSelectedTest(event) {
    const targetDate = event.target.selectedOptions[0].getAttribute('startdate')
    report = event.target.value;
    selectedTest.set(event.target.value);

    data.subscribe((value) => filterDataByDate(targetDate));

    // // Refilter data based on new date
    // data.subscribe((value) => filterDataByDate(targetDate));
    // console.log(data)
  }

</script>

<div class="container mx-auto p-4 report">
  <div class="flex justify-between items-center">
    <select class="p-2 border border-gray-400 rounded" on:change={updateSelectedTest}>
      <option value="">Select a test</option>
      {#each $tests as test}
        <option startdate='{test.START_DATE}' value={test.NAME}>{test.NAME} - {formatDate(test.START_DATE)} {test.TEST_LEVEL || ''}</option>
      {/each}
    </select>
  </div>
  {#if selectedTest}
    {#if $loading}
      <p class="text-center text-gray-500">Loading data...</p>
    {:else if $error}
      <p class="text-center text-red-500">Error: {$error.message}</p>
    {:else if $filteredData.length > 0}
      <h1 class="text-2xl font-bold mb-4">{report}</h1>
      <table class="table-auto border-collapse border border-gray-400">
        <thead>
          <tr>
            <th class="sticky top-0 px-4 py-2 bg-gray-100 border border-gray-950">Cal Date</th>
            <th class="sticky top-0 px-4 py-2 bg-gray-100 border border-gray-950">Day Number</th>
            <th class="sticky top-0 px-4 py-2 bg-gray-100 border border-gray-950">% Before</th>
            <th class="sticky top-0 px-4 py-2 bg-gray-100 border border-gray-950">% After</th>
          </tr>
        </thead>
        <tbody>
          {#each $filteredData as item}
            
            <tr>
              <td class="px-4 py-2 border border-gray-950 text-center">{item.CAL_DATE}</td>
              <td class="px-4 py-2 border border-gray-950 text-center">{item.DAY_NUMBER}</td>
              <td class="px-4 py-2 border border-gray-950 text-center">{item.PERCENT_BEFORE}</td>
              <td class="px-4 py-2 border border-gray-950 text-center">{item.PERCENT_AFTER}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {:else}
      <p class="text-center text-gray-500">No data available for the selected date and report.</p>
    {/if}
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