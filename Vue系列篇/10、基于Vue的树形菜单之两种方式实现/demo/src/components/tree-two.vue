<script>
import img1  from '../assets/img/icon_arrow_right.png'
import img2 from '../assets/img/icon_arrow_down.png'
export default {
  name: 'TreeTwo',
  props: {
    treeData: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  render(r){
    return this.elements(this.treeData,r)
  },
  methods: {
    elements(data,r){
      return r('ul',[
        data.map(item => {
          if (item.children && item.children.length > 0) {
            return r('li',{
              'class': {
                active: !(item.children && item.children.length > 0)
              }
            },[
              r('span',{
                'class':'item'
              },[
                r('span',{
                  'class': 'icon',
                  on:{
                    click: () => {
                      item.isExpand = !item.isExpand
                    }
                  }
                },[
                  r('img',{
                    attrs: {
                      src: item.children && item.children.length > 0 && !item.isExpand ? 
                      img1 : (item.children && item.children.length > 0 && item.isExpand ? img2 : '')
                    }
                  })
                ]),
                r('span',{
                  'class': 'title',
                  on: {
                    click: () => {
                      
                    }
                  }
                },item.meta.text,)
              ]),
              // 递归调用
              item.isExpand ? this.elements(item.children,r): null
            ])
          } else {
            return r('li',item.meta.text)
          }
        })
      ])
    }
  }
}
</script>
<style>
li{
  line-height: 30px;
  cursor: pointer;
}
.active{
  padding-left: 16px;
}
</style>


