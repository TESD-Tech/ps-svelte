<svelte:options customElement="ps-svelte-course-level-data" />
<script>
  import { onMount } from 'svelte';

  // Import JSON data for development environment
  import dev_student from '../data/course_level_data_student.json';
  import dev_roster from '../data/course_level_data_roster.json';

  // Initialize data structures
  let data = []; // Array to hold processed course data for display
  let grade_level_lookup = {}; // Lookup table for grade level information
  let courses = {}; // Temporary object to hold course data during processing
  let asOfDate = new Date().toISOString().split('T')[0]; // Today's date as a string
  let schools = []; // Array of unique school names

  // Determine environment (production or development) using import.meta.env
  const isProduction = !import.meta.env.DEV;

  /**
   * Fetches and processes course level data based on the asOfDate.
   * 
   * @param {string} asOfDate - The date for which to retrieve data (YYYY-MM-DD format).
   */
  async function updateData(asOfDate) {
    let queryString = '';
    let rosters;
    let students;

    // Construct query string if asOfDate is provided
    if (asOfDate) {
      queryString = `?asOfDate=${asOfDate}`;
    }

    // Fetch data based on environment
    if (isProduction) {
      const response = await fetch(`/admin/ps-svelte/json/course_level_data.json${queryString}`);
      rosters = await response.json();
    } else {
      // Use development data for local testing
      rosters = dev_roster;
      students = dev_student;
    }

    // Process student data to populate grade_level_lookup
    students.forEach(student => {
      // Skip Grade 13 and students with ethnicity 'I'
      if (student.DISPLAY_GRADE === 'Grade 13' || student.ETHNICITY === 'I') {
        return;
      }

      // Initialize grade level entry if it doesn't exist
      if (!grade_level_lookup[student.DISPLAY_GRADE]) {
        grade_level_lookup[student.DISPLAY_GRADE] = {
          SCHOOL: student.SCHOOL,
          A: 0,
          B: 0,
          H: 0,
          M: 0,
          W: 0,
          TOTAL_STUDENTS: 0,
          DISPLAY_GRADE: student.DISPLAY_GRADE
        };
      }

      // Update student counts for the grade level
      grade_level_lookup[student.DISPLAY_GRADE].TOTAL_STUDENTS += 1;
      grade_level_lookup[student.DISPLAY_GRADE][student.ETHNICITY] += 1;
    });

    // Process roster data to populate the courses object
    rosters.forEach(r => {
      // Initialize course entry if it doesn't exist
      if (!courses[r.DISPLAY_NAME]) {
        courses[r.DISPLAY_NAME] = {
          SCHOOL: r.SCHOOL,
          DISPLAY_NAME: r.DISPLAY_NAME,
          A: 0,
          B: 0,
          H: 0,
          M: 0,
          W: 0,
          TOTAL_STUDENTS: 0,
          SORT_ORDER: r.SORT_ORDER,
          DISPLAY_GRADE: r.DISPLAY_GRADE
        };
      }

      // Update student counts for the course
      courses[r.DISPLAY_NAME].TOTAL_STUDENTS += 1;
      courses[r.DISPLAY_NAME][r.ETHNICITY] += 1;
    });

    // Sort courses by school and SORT_ORDER
    let sortedCourses = Object.values(courses).sort((a, b) => {
      if (a.SORT_ORDER.slice(0, 4) < b.SORT_ORDER.slice(0, 4)) return -1;
      if (a.SORT_ORDER.slice(0, 4) > b.SORT_ORDER.slice(0, 4)) return 1;
      if (a.SORT_ORDER < b.SORT_ORDER) return -1;
      if (a.SORT_ORDER > b.SORT_ORDER) return 1;
      return 0;
    });

    // Group data by course name and DISPLAY_GRADE
    let groupedData = sortedCourses.reduce((acc, item) => {
      let key = `${item.DISPLAY_NAME}-${item.DISPLAY_GRADE}`;
      if (!acc[key]) {
        acc[key] = {
          DISPLAY_NAME: item.DISPLAY_NAME,
          DISPLAY_GRADE: item.DISPLAY_GRADE,
          SCHOOL: item.SCHOOL,
          SORT_ORDER: item.SORT_ORDER,
          A: 0,
          B: 0,
          H: 0, 
          M: 0,
          W: 0,
          TOTAL_STUDENTS: 0
        };
      }
      
      // Increment ethnicity counts and calculate total students
      if (!acc[key][item.ETHNICITY]) {
        acc[key][item.ETHNICITY] = 1;
      } else {
        acc[key][item.ETHNICITY]++;
      }
      acc[key].TOTAL_STUDENTS++;

      return acc;
    }, {});

    // Process grouped data and calculate percentages
    data = Object.values(groupedData).map(item => ({
      SCHOOL: item.SCHOOL,
      SORT_ORDER: item.SORT_ORDER,
      DISPLAY_NAME: item.DISPLAY_NAME,
      A: item.A,
      A_PERCENTAGE: Math.round(item.A / item.TOTAL_STUDENTS * 100),
      B: item.B, 
      B_PERCENTAGE: Math.round(item.B / item.TOTAL_STUDENTS * 100),
      H: item.H,
      H_PERCENTAGE: Math.round(item.H / item.TOTAL_STUDENTS * 100),
      M: item.M,
      M_PERCENTAGE: Math.round(item.M / item.TOTAL_STUDENTS * 100),
      W: item.W,
      W_PERCENTAGE: Math.round(item.W / item.TOTAL_STUDENTS * 100) 
    }));

    // Sort data by school and DISPLAY_NAME
    data.sort((a, b) => {
      if (a.SORT_ORDER.slice(0, 4) < b.SORT_ORDER.slice(0, 4)) return -1;
      if (a.SORT_ORDER.slice(0, 4) > b.SORT_ORDER.slice(0, 4)) return 1;
      if (a.DISPLAY_NAME < b.DISPLAY_NAME) return -1; 
      if (a.DISPLAY_NAME > b.DISPLAY_NAME) return 1;
      return 0;
    });
  }

  // Update schools array whenever data changes
  $: schools = [...new Set(data.map(d => d.SCHOOL))];

  // Fetch and process data on component mount 
  onMount(async () => {
    await updateData(asOfDate);
  });

  $: schools = [...new Set(data.map(d => d.SCHOOL))];
  $: {
  (async () => {
    await updateData(asOfDate);
  })();

  // Reactively update data when asOfDate changes
  // <!-- Remove the duplicate `$: updateData(asOfDate);` line -->
}
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
  <div class="pb-4">
    <label for="asOfDate">As of: </label>
    <input type="date" bind:value={asOfDate} id="asOfDate">
  </div>
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
              <td class="text-center">{course.TOTAL_STUDENTS}!</td>
              <td class="text-center">{course.A}</td>
              <td class="text-center">{course.TOTAL_STUDENTS}%</td>
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
              <td class="text-center bg-slate-400">{course.DISPLAY_GRADE}!</td> 
              <td class="text-center bg-slate-400" colspan=2>A: {Math.round(course.A / course.TOTAL_STUDENTS * 100)}%</td>
              <td class="text-center bg-slate-400" colspan=2>B: {Math.round(course.B / course.TOTAL_STUDENTS * 100)}%</td>
              <td class="text-center bg-slate-400" colspan=2>H: {Math.round(course.H / course.TOTAL_STUDENTS * 100)}%</td>
              <td class="text-center bg-slate-400" colspan=2>M: {Math.round(course.M / course.TOTAL_STUDENTS * 100)}%</td>
              <td class="text-center bg-slate-400" colspan=2>W: {Math.round(course.W / course.TOTAL_STUDENTS * 100)}%</td>
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
          <div>A: Asian!</div>
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
