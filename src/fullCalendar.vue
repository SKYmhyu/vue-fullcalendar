<template>
  <div class="comp-full-calendar">
    <!-- header pick month -->
    <fc-header :current-date="currentDate" 
      :title-format="titleFormat"
      :first-day="firstDay"
      :month-names="monthNames"
      @change="emitChangeMonth">

      <div slot="header-left">
        <slot name="fc-header-left">
        </slot>
      </div>

      <div slot="header-right">
        <slot name="fc-header-right">
        </slot>
      </div>
    </fc-header>
    <!-- body display date day and events -->
    <fc-body :current-date="currentDate" :events="events" :month-names="monthNames" 
      :week-names="weekNames" :first-day="firstDay" :showDialog="showDialog"
      @eventclick="emitEventClick" @dayclick="emitDayClick"
      @close="close"
      @moreclick="emitMoreClick">
      <div slot="body-card">
        <slot name="fc-body-card">
        </slot>
      </div>
      <div slot="body-dialog">
        <slot name="dialog">
        </slot>
      </div>
    </fc-body>
  </div>
</template>
<script type="text/babel">
  import langSets from './dataMap/langSets'

  export default {
    props : {
      events : { // events will be displayed on calendar
        type : Array,
        default : []
      },
      showDialog  : {
        type: Boolean,
        default : false,
      },
      lang : {
        type : String,
        default : 'en'
      },
      firstDay : {
        type : Number | String,
        validator (val) {
          let res = parseInt(val)
          return res >= 0 && res <= 6
        },
        default : 0
      },
      titleFormat : {
        type : String,
        default () {
          return langSets[this.lang].titleFormat
        }
      },
      monthNames : {
        type : Array,
        default () {
          return langSets[this.lang].monthNames
        } 
      },
      weekNames : {
        type : Array,
        default () {
          let arr = langSets[this.lang].weekNames
          return arr.slice(this.firstDay).concat(arr.slice(0, this.firstDay))
        }
      }
    },
    data () {
      return {
        currentDate : new Date()
      }
    },
    methods : {
      emitChangeMonth (start, end, currentStart, current) {
        // console.log('currentDate 2', this.currentDate)
        this.currentDate = current
        // console.log('currentDate 3', this.currentDate)
        this.$emit('changeMonth', start, end, currentStart)
      },
      emitEventClick (event, jsEvent, pos) {
        this.$emit('eventClick', event, jsEvent, pos)
      },
      emitDayClick (day, jsEvent) {
        this.$emit('dayClick', day, jsEvent)
      },
      emitMoreClick (day, events, jsEvent) {
        this.$emit('moreClick', day, event, jsEvent)
      },
      close() {
        this.$emit('close', false);
      },
    },
    components : {
      'fc-body'   : require('./components/body'),
      'fc-header' : require('./components/header')
    }
  }
  
</script>
<style lang="scss">
  .comp-full-calendar{
    // font-family: "elvetica neue", tahoma, "hiragino sans gb";
    padding:20px;
    background: #fff;
    // max-width: 960px;
    max-width: 100%;
    margin:0 auto;
    ul,p{
      margin:0;
      padding:0;
      font-size: 14px;
    }
  }
</style>