<svelte:options customElement="ps-svelte-course-level-data" />
<script>
  import { onMount } from 'svelte';
  import dev_student from '../data/course_level_data_student.json';
  import dev_roster from '../data/course_level_data_roster.json';

  const ethicalities = ['A', 'B', 'H', 'M', 'W'];
  let data = [];
  let grade_level_lookup = {};
  let courses = {};
  let asOfDate = new Date().toISOString().split('T')[0];
  const isProduction = !import.meta.env.DEV;

  // Function to fetch data based on environment and date
  async function fetchData(asOfDate) {
    const queryString = asOfDate ? `?asOfDate=${asOfDate}` : '';
    return isProduction
      ? await (await fetch(`/admin/ps-svelte/json/course_level_data_roster.json${queryString}`)).json()
      : dev_roster;
  }

  // Function to process student data and populate grade_level_lookup
  function processStudentData(students) {
    students.forEach(student => {
      if (student.DISPLAY_GRADE === 'Grade 13' || student.ETHNICITY === 'I') return;
      grade_level_lookup[student.DISPLAY_GRADE] ??= {
        SCHOOL: student.SCHOOL,
        ...ethicalities.reduce((acc, e) => ({ ...acc, [e]: 0 }), {}),
        TOTAL_STUDENTS: 0,
        DISPLAY_GRADE: student.DISPLAY_GRADE,
      };
      grade_level_lookup[student.DISPLAY_GRADE].TOTAL_STUDENTS += 1;
      grade_level_lookup[student.DISPLAY_GRADE][student.ETHNICITY] += 1;
    });
  }

  // Function to process course data and populate courses
  function processCourseData(rosters) {
    rosters.forEach(r => {
      courses[r.DISPLAY_NAME] ??= {
        SCHOOL: r.SCHOOL,
        DISPLAY_NAME: r.DISPLAY_NAME,
        ...ethicalities.reduce((acc, e) => ({ ...acc, [e]: 0 }), {}),
        TOTAL_STUDENTS: 0,
        SORT_ORDER: r.SORT_ORDER,
        DISPLAY_GRADE: r.DISPLAY_GRADE,
      };
      courses[r.DISPLAY_NAME].TOTAL_STUDENTS += 1;
      courses[r.DISPLAY_NAME][r.ETHNICITY] += 1;
    });
  }

  // Function to calculate percentages and format data
  function formatData(groupedData) {
    return Object.values(groupedData).map(item => ({
      ...item,
      ...ethicalities.reduce((acc, e) => ({
        ...acc,
        [`${e}_PERCENTAGE`]: Math.round(item[e] / item.TOTAL_STUDENTS * 100),
      }), {}),
    }));
  }

  // Function to sort data based on school and display name/order
  function sortData(dataToSort, sortBy = 'SORT_ORDER') {
    // return dataToSort.sort((a, b) => {
    //   if (a.SORT_ORDER.slice(0, 4) !== b.SORT_ORDER.slice(0, 4)) {
    //     return a.SORT_ORDER.slice(0, 4) < b.SORT_ORDER.slice(0, 4) ? -1 : 1;
    //   }
    //   return a[sortBy] < b[sortBy] ? -1 : 1;
    // });


    // Sort the data array by school and then by SORT_ORDER
    return Object.values(dataToSort).sort((a, b) => {
      if (a.SORT_ORDER.slice(0,4) < b.SORT_ORDER.slice(0,4)) return -1;
      if (a.SORT_ORDER.slice(0,4) > b.SORT_ORDER.slice(0,4)) return 1;
      if (a.SORT_ORDER < b.SORT_ORDER) return -1;
      if (a.SORT_ORDER > b.SORT_ORDER) return 1;
      return 0;
    })
  }

  // Update data function
  async function updateData(asOfDate) {
    const rosters = await fetchData(asOfDate);
    processStudentData(isProduction ? await (await fetch('/admin/ps-svelte/json/course_level_data_student.json')).json() : dev_student);
    processCourseData(rosters);
    const groupedData = rosters.reduce((acc, item) => {
      const key = `${item.DISPLAY_NAME}-${item.DISPLAY_GRADE}`;
      acc[key] ??= { ...item, ...ethicalities.reduce((acc, e) => ({ ...acc, [e]: 0 }), {}), TOTAL_STUDENTS: 0 };
      acc[key][item.ETHNICITY]++;
      return acc;
    }, {});
    data = formatData(groupedData);
    data = sortData(data);
    courses = sortData(formatData(courses), 'SORT_ORDER');
  }

  // Function to get total enrollments for a course 
  function getEnrollments(course) {
    return ethicalities.reduce((total, e) => total + course[e], 0);
  }

  onMount(async () => {
    await updateData();
  });

  $: schools = [...new Set(data.map(d => d.SCHOOL))];
  $: {
    (async () => {
      await updateData(asOfDate);
    })();
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
                <td class="text-center">{getEnrollments(course)}</td>

                {#each ethicalities as e}
                  <td class="text-center">{course[e]}</td>
                  <td class="text-center">{Math.round(course[e] / getEnrollments(course) * 100)}%</td>
                {/each}
              {:else}
              <td class="bg-slate-400">&nbsp;</td>
              <td class="text-center bg-slate-400">{course.DISPLAY_GRADE}</td> 

              {#each ethicalities as e}
                <td class="text-center">{course[e]}</td>
                <td class="text-center">A: {Math.round(course[e] / course.TOTAL_STUDENTS * 100)}%</td>
              {/each}

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
