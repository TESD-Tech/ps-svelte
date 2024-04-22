<script>
  import { onMount } from 'svelte';
  import devData  from '../assets/courseData.json'

  let data = [];

  // Determine the environment (production or development)
  const isProduction = !import.meta.env.DEV;

  onMount(async () => {
    if (isProduction) {
      const response = await fetch('/admin/tesd_custom_reports/json_course_level_data.json');
      data = await response.json();
    } else {
      // Use development sections data
      data = devData
    }

  });

  $: schools = [...new Set(data.map(d => d.SCHOOL))];
</script>

<style>
  /* Styling for tables and cells */
</style>

{#each schools as school}
  <h2>{school}</h2>
  <table>
    <thead>
      <tr>
        <th>Course Name</th>
        <th>Enrollments</th>
        <th>Actual_A %_A</th>
        <th>Actual_B %_B</th>
        <th>Actual_H %_H</th>
        <th>Actual_M %_M</th>
        <th>Actual_W %_W</th>
      </tr>
    </thead>
    <tbody>
      {#each data.filter(d => d.SCHOOL === school) as course}
        <tr>
          <td>{course.DISPLAY_NAME || course.DISPLAY_GRADE}</td>
          <td>{course.TOTAL_STUDENTS}</td>
          <td>{course.A} ({course.A_PERCENTAGE}%)</td>
          <td>{course.B} ({course.B_PERCENTAGE}%)</td>
          <td>{course.H} ({course.H_PERCENTAGE}%)</td>
          <td>{course.M} ({course.M_PERCENTAGE}%)</td>
          <td>{course.W} ({course.W_PERCENTAGE}%)</td>
        </tr>
      {/each}
    </tbody>
  </table>
{/each}

<p>
  A: Asian M: Multiracial AP: Advanced Placement X: Accelerated<br>
  B: Black or African American W: White H: Honors A: Academic H: Hispanic/Latino
</p>