<template>
  <div>
  	<p>
  		Here is the demo of vue-fullcalendar, no jquery fullcalendar.js required!
  	</p>
    <full-calendar class="test-fc" :events="fcEvents" 
      first-day='1' lang="zh"
      :showDialog="showDialog"
      @changeMonth="changeMonth"
      @eventClick="eventClick"
      @dayClick="dayClick"
      @close="close"
      @moreClick="moreClick">
      <p slot="dialog">sadfsd</p>
    </full-calendar>
  </div>
</template>
<script>
let demoEvents = [
    {
      title    : 'Sunny 725-727Sunny 725-727',
      start    : '2021-06-25',
      end      : '2021-06-27',
      color    : 'pink',
    },
    {
      title : 'Sunny 726-727',
      start    : '2021-06-25',
      end      : '2021-06-27',
      color    : 'pink',
    },
    {
      title : 'Sunny 727-728',
      start    : '2021-06-25',
      end      : '2021-06-27',
      color    : 'pink',
    },
    {
      title : 'Sunny 728-730',
      start    : '2021-06-25',
      end      : '2021-06-27',
      color    : 'pink',
    },
  ]

export default {
	data () {
		return {
      name:'Sunny!',
      fcEvents : demoEvents,
      showDialog: false,
    }
	},
  methods : {
    'changeMonth' (start, end, current) {
      console.log('changeMonth', start, end, current)
    },
    'eventClick' (event, jsEvent, pos) {
      this.showDialog = true;
       console.log('eventClick', event, jsEvent, pos)
    },
    // 'dayClick' (day, jsEvent) {
    //   this.showDialog = true;
    //   console.log(showDialog);
    //   console.log('dayClick', day, jsEvent)
    // },
    dayClick(day, jsEvent) {
      this.showDialog = true;
    },
    close() {
      this.showDialog = false;
    },
    'moreClick' (day, events, jsEvent) {
      console.log('moreCLick', day, events, jsEvent)
    }
  },
  components : {
    'full-calendar' : require('src/fullCalendar')
  }
}
</script>
<style lang='scss'>
  .app{
    color:green;
  }
</style>