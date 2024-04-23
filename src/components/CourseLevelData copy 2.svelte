<svelte:options customElement="ps-svelte-course-level-data" />
<script>
  import { onMount } from 'svelte';
  import dev_student from '../data/course_level_data_student.json';
  import dev_roster from '../data/course_level_data_roster.json';

  let ethicalities = ['A', 'B', 'H', 'M', 'W'];

  let data = [];
  let grade_level_lookup = {}
  let courses = {};

  let asOfDate = new Date().toISOString().split('T')[0];

  // Determine the environment (production or development)
  const isProduction = !import.meta.env.DEV;

  async function updateData(asOfDate) {
    let queryString = '';
    let rosters;
    let students;

    if (asOfDate)
      queryString = `?asOfDate=${asOfDate}`;

    if (isProduction) {
      const response = await fetch(`/admin/ps-svelte/json/course_level_data.json${queryString}`);
      rosters = await response.json();
    } else {
      // Use development sections data
      rosters = dev_roster;
      students = dev_student;
    }

    // Populate grade_level_lookup using the students data and DISPLAY_GRADE
    students.forEach(student => {
      if (student.DISPLAY_GRADE === 'Grade 13')
        return

      if (student.ETHNICITY === 'I')
        return

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
        }
      }

      grade_level_lookup[student.DISPLAY_GRADE].TOTAL_STUDENTS += 1;
      grade_level_lookup[student.DISPLAY_GRADE][student.ETHNICITY] += 1;

    })


    console.log(grade_level_lookup)

    // Populate the data array with the rosters data
    rosters.forEach(r => {
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
        }
      } 

      courses[r.DISPLAY_NAME].TOTAL_STUDENTS += 1;
      courses[r.DISPLAY_NAME][r.ETHNICITY] += 1;
    })

    // Sort the data array by school and then by SORT_ORDER
    courses = Object.values(courses).sort((a, b) => {
      if (a.SORT_ORDER.slice(0,4) < b.SORT_ORDER.slice(0,4)) return -1;
      if (a.SORT_ORDER.slice(0,4) > b.SORT_ORDER.slice(0,4)) return 1;
      if (a.SORT_ORDER < b.SORT_ORDER) return -1;
      if (a.SORT_ORDER > b.SORT_ORDER) return 1;
      return 0;
    })

    console.log(courses)


    let groupedData = rosters.reduce((acc, item) => {
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
        if (!acc[key][item.ETHNICITY]) {
          acc[key][item.ETHNICITY] = 1;
        } else {
          acc[key][item.ETHNICITY]++;
        }
        return acc;
      }, {});

      for (let key in groupedData) {
        let total = 0;
        for (let ethnicity in groupedData[key]) {
          total += groupedData[key][ethnicity];
        }
        // groupedData[key].TOTAL_STUDENTS = total;
    } 

    // Iterate groupedData and push the values to the data array
    let this_data = []
    for (let key in groupedData) {
      let item = groupedData[key];
      this_data.push({
        SCHOOL: item.SCHOOL,
        SORT_ORDER: item.SORT_ORDER,
        DISPLAY_NAME: item.DISPLAY_NAME,
        // TOTAL_STUDENTS: item.TOTAL_STUDENTS,
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
      });
    }

    // Sort the data array by school and then by DISPLAY_NAME
    this_data = this_data.sort((a, b) => {
      if (a.SORT_ORDER.split(0,4) < b.SORT_ORDER.split(0,4)) return -1;
      if (a.SORT_ORDER.split(0,4) > b.SORT_ORDER.split(0,4)) return 1;
      if (a.DISPLAY_NAME < b.DISPLAY_NAME) return -1;
      if (a.DISPLAY_NAME > b.DISPLAY_NAME) return 1;
      return 0;
    });


    data = this_data

    console.log(data)

  }


  function getEnrollments(course) {
    // Sum the ethnicities for the course
    let total = 0;
    ethicalities.forEach(e => {
      total += course[e];
    })

    return total;
  }

  onMount(async () => {
    updateData()
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
              <td class="text-center bg-slate-400">{course.DISPLAY_GRADE}</td> 
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
