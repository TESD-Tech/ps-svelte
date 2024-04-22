<svelte:options customElement="ps-svelte-course-level-data" />
<script>
  import { onMount } from 'svelte';
  import devData  from '../assets/course_data.json'

  let data = [];

  // Determine the environment (production or development)
  const isProduction = !import.meta.env.DEV;

  onMount(async () => {
    if (isProduction) {
      const response = await fetch('/admin/ps-svelte/json/course_level_data.json');
      data = await response.json();
    } else {
      // Use development sections data
      data = devData
    }

    console.log(data)

  });

  $: schools = [...new Set(data.map(d => d.SCHOOL))];
</script>

<style>
  .rotate {
    transform: rotate(-90deg);

    white-space: nowrap;
  }

  table {
    border-collapse: collapse;
    width: 100%;
  }

  table th, table td {
    border: 1px solid black;
    padding: 8px;
  }

  #report {
    font-family: Arial, Helvetica, sans-serif
  }


</style>

<div id="report" class="">
  <h2>Distrtictwide Course Level Data</h2>
  <div id="tables" class="grid grid-flow-col gap-6 border-collapse grid-cols-1 grid-rows-5">

    {#each schools as school}
      <table class="table">
        <thead>
          <tr>
            <th class="bg-slate-400">&nbsp;</th>
            <th class="bg-slate-400">Course Name</th>
            <th class="bg-slate-400">Enrollments</th>
            <th class="bg-slate-400">Actual_A</th>
            <th class="bg-slate-400">%_A</th>
            <th class="bg-slate-400">Actual_B</th>
            <th class="bg-slate-400">%_B</th>
            <th class="bg-slate-400">Actual_H</th>
            <th class="bg-slate-400">%_H</th>
            <th class="bg-slate-400">Actual_M</th>
            <th class="bg-slate-400">%_M</th>
            <th class="bg-slate-400">Actual_W</th>
            <th class="bg-slate-400">%_W</th>
          </tr>
        </thead>
        <tbody>
          {#each data.filter(d => d.SCHOOL === school) as course, index}
            <tr>
              {#if index === 0}
                <td class="rotate" rowspan={data.filter(d => d.SCHOOL === school).length}>{school}</td>
              {/if}
              
              {#if course.DISPLAY_NAME}
              <td class="text-center">{course.DISPLAY_NAME}</td>
              <td class="text-center">{course.TOTAL_STUDENTS}</td>
              <td class="text-center">{course.A}</td>
              <td class="text-center">{course.A_PERCENTAGE}%</td>
              <td class="text-center">{course.B}</td>
              <td class="text-center">{course.B_PERCENTAGE}%</td>
              <td class="text-center">{course.H}</td>
              <td class="text-center">{course.H_PERCENTAGE}%</td>
              <td class="text-center">{course.M}</td>
              <td class="text-center">{course.M_PERCENTAGE}%</td>
              <td class="text-center">{course.W}</td>
              <td class="text-center">{course.W_PERCENTAGE}%</td>
              {:else}
              <td class="bg-slate-400">&nbsp;</td>
              <td class="text-center bg-slate-400">{course.DISPLAY_GRADE}</td> 
              <td class="text-center bg-slate-400" colspan=2>A: {course.A_PERCENTAGE}%</td>
              <td class="text-center bg-slate-400" colspan=2>B: {course.B_PERCENTAGE}%</td>
              <td class="text-center bg-slate-400" colspan=2>H: {course.H_PERCENTAGE}%</td>
              <td class="text-center bg-slate-400" colspan=2>M: {course.M_PERCENTAGE}%</td>
              <td class="text-center bg-slate-400" colspan=2>W: {course.W_PERCENTAGE}%</td>
              {/if}
            </tr>
          {/each}
        </tbody>
      </table>
    {/each}
  
    <div class="grid grid-cols-2">
      <div>
        <div class="grid grid-cols-2 border border-slate-400">
          <h4 class="col-span-2 text-center">Key</h4>
          <div>A: Asian</div>
          <div>M: Multiracial</div>
          <div>B: Black or African American</div>
          <div>W: White</div>
          <div>H: Hispanic/Latino</div>
        </div>
      </div>
      <div>
        <div class="grid grid-cols-2 border border-slate-400">
          <h4 class="col-span-2 text-center">CHS Levels</h4>
          <div class="border-2 border-indigo-500">AP: Advanced Placement</div>
          <div>X: Accelerated</div>
          <div>H: Honors</div>
          <div>A: Academic</div>
        </div>
      </div>
    </div>
  </div>
</div>
