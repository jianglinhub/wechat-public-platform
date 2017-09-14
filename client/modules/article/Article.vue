<template>
    <div>
        <Form :label-width="70" inline style="margin: 20px 20px 0 0">
            <FormItem label="标题">
                <Input v-model="articleSearch.title" placeholder="请输入"></Input>
            </FormItem>
            <Button type="primary" @click="getArticle()">搜索</Button>
            <Button type="warning" @click="massModalShow = true" style="float:right;margin-left:12px;">群发</Button>
            <Button type="primary" @click="articleModule('add');modalTitle = '新增';" style="float:right">新增</Button>
        </Form>
        <Table border :columns="tableTitle" :data="articleList"></Table>
        <Page :total="articleSearch.pageCount" :current="articleSearch.pageIndex" :page-size="10"
              @on-change="getArticle" style="margin: 20px"></Page>
        <Modal
            v-model="articleModalShow"
            :title="modalTitle"
            @on-ok="dealArticle()">
            <Form :label-width="70" inline>
                <FormItem label="标题">
                    <Input v-model="articleSelected.title" placeholder="请输入"></Input>
                </FormItem>
                <FormItem label="作者">
                    <Input v-model="articleSelected.author" placeholder="请输入"></Input>
                </FormItem>
                <FormItem label="原文链接">
                    <Input v-model="articleSelected.source_url" placeholder="请输入 http://..." style="width:362px;"></Input>
                </FormItem>
                <FormItem label="海报链接">
                    <Input v-model="articleSelected.poster_url" placeholder="请输入 http://..." style="width:362px;"></Input>
                </FormItem>
                <FormItem label="摘要">
                    <Input v-model="articleSelected.digest" type="textarea" style="width:362px;" :autosize="{minRows: 3,maxRows: 5}" placeholder="请输入"></Input>
                </FormItem>
                <!-- <FormItem label="内容">
                    <div id="content" style="height: 300px;width:362px;"></div>
                </FormItem> -->
            </Form>
            <div slot="footer">
                <Button @click="articleModalShow = false">取消</Button>
                <Button type="primary" @click="dealArticle()">确定</Button>
            </div>
        </Modal>
        <Modal
            v-model="detailModalShow"
            title="详情">
            <h2 class="text-center">{{articleSelected.title}}</h2>
            <p class="text-center">作者：{{articleSelected.author}}</p>
            <br/>
            <div v-html='articleSelected.content'></div>
            <div slot="footer">
                <Button type="primary" @click="detailModalShow = false">关闭</Button>
            </div>
        </Modal>
        <Modal  
            title="删除"
            v-model="deleteModalShow">
            <p>确定要删除这篇文章吗？</p>
            <div slot="footer">
                <Button @click="deleteModalShow = false">取消</Button>
                <Button type="primary" @click="deleteArticle()">确定</Button>
            </div>
        </Modal>

        <Modal  
            title="群发"
            v-model="massModalShow">
            <Alert show-icon closable>点击发送，下列文章将直接群发给用户。公众号一天只能群发一次消息。<span slot="close">不再提示</span></Alert>
            <Table border :columns="massColumns" :data="massData.items"></Table>
            <div slot="footer">
                <Button @click="massModalShow = false">取消</Button>
                <Button type="primary" @click="massModalShow = false">发送</Button>
            </div>
        </Modal>

    </div>
</template>
<style>
    textarea.ivu-input {
        font-size: 12px;
    }
</style>
<script>
    import 'wangeditor/dist/js/wangEditor.min.js'
    import { NUtil } from '../common/Utils.js'

    export default {
        data() {
            return {
                isMessageListShow: false,
                //模态框显示，依次为文章编辑添加模态框、详情模态框、删除模态框
                articleModalShow: false,
                detailModalShow: false,
                deleteModalShow: false,
                modalTitle: '新增',
                massModalShow: false,
                //文章模态框是编辑还是新增（add/edit）
                articleModalShowType: 'none',
                massColumns: [
                    {
                        title: '标题',
                        key: 'title'
                    },
                    {
                        title: '操作',
                        key: 'action',
                        width: 150,
                        align: 'center',
                        render: (h, params) => {
                            return h('div', [
                                h('Icon', {
                                    props: {
                                        type: 'ios-trash-outline',
                                        size: 20
                                    },
                                    on: {
                                        click: () => {
                                            this.show(params.row._id)
                                        }
                                    }
                                })
                            ])
                        }
                    }
                ],
                massData: {
                    items: [],
                    _ids: []
                },
                tableTitle: [
                    {
                        title: '标题',
                        key: 'title',
                    },
                    {
                        title: '作者',
                        key: 'author'
                    },
                    {
                        title: '创建时间',
                        key: 'create_time'
                    },
                    {
                        title: '最近修改时间',
                        key: 'update_time'
                    },
                    {
                        title: '操作',
                        key: 'action',
                        width: 300,
                        align: 'center',
                        render: (h, params) => {
                            return h('div', [
                                h('Button', {
                                    props: {
                                        type: 'primary',
                                        size: 'small'
                                    },
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.modalTitle = '编辑'
                                            this.articleModule('edit', params.index)
                                        }
                                    }
                                }, '编辑'),
                                h('Button', {
                                    props: {
                                        type: 'primary',
                                        size: 'small'
                                    },
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.showArticleDetail(params.index)
                                        }
                                    }
                                }, '详情'),
                                h('Button', {
                                    props: {
                                        type: 'error',
                                        size: 'small'
                                    },
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.toDeleteArticle(params.index)
                                        }
                                    }
                                }, '删除'),
                                h('Button', {
                                    props: {
                                        type: 'primary',
                                        size: 'small'
                                    },
                                    on: {
                                        click: () => {
                                            if (!this.massData._ids.includes(params.row._id)) {
                                                this.massData._ids.push(params.row._id)
                                                this.addToMassSend(params.row)
                                            }
                                        }
                                    }
                                }, '加入群发')
                            ])
                        }
                    }
                ],
                articleList: [],
                articleSearch: {
                    title: '',
                    startTime: 0,
                    endTime: new Date(),
                    pageSize: 10,
                    pageIndex: 1,
                    pageCount: 0,
                },
                articleSelected: {}
            }
        },
        methods: {
            articleModule(type, index) {
                let _this = this
                let contentHtml 
                _this.articleModalShow = true
                _this.articleModalShowType = type
                _this.articleSelected = index >= 0 ? this.articleList[index] : {}
                contentHtml = type === 'add' ? '' : this.articleSelected.content
                // _this.editor.$txt.html(contentHtml)
            },
            dealArticle() {
                let _this = this
                // _this.articleSelected.content = _this.editor.$txt.html()
                if (_this.articleModalShowType === 'add') {
                    _this.addArticle()
                } else if (_this.articleModalShowType === 'edit') {
                    this.editArticle()
                }
            },
            showArticleDetail(index) {
                let _this = this
                _this.detailModalShow = true
                _this.articleSelected = _this.articleList[index]
            },
            toDeleteArticle(index) {
                let _this = this
                _this.deleteModalShow = true
                _this.articleSelected = this.articleList[index]
            },
            
            /**
             * editor初始化
             */
            // initEditor() {
            //     let _this = this
            //     _this.editor = new wangEditor('content')
            //     _this.editor.config.menus = [
            //         'bold',  // 粗体
            //         'italic',  // 斜体
            //         'link',  // 插入链接
            //         'image'  // 插入图片
            //     ]
            //     _this.editor.config.uploadImgUrl = 'message/api/uploadImage'
            //     _this.editor.create()
            // },

            /**
             * 获取文章列表
             */
            getArticle(index) {
                let _this = this
                _this.articleSearch.pageIndex = index
                _this.$http.get('api/articles', {params: _this.articleSearch}).then(function (res) {
                    let re = res.body
                    if (re.status === 1) {
                        _this.articleList = re.datas
                        _this.queryDateFilter(re.datas)
                        _this.articleSearch.pageCount = re.totalCount

                    }
                })
            },

            /**
             * 新增文章
             */
            addArticle() {
                let _this = this
                _this.$http.post('api/articles', this.articleSelected).then(function (res) {
                    if (res.body.status === 1) {
                        _this.getArticle()
                    } else {
                        _this.$Message.error('新增文章失败')
                    }
                    _this.articleModalShow  =false
                })
            },

            /**
             * 编辑文章
             */
            editArticle() {
                let _this = this
                _this.$http.put('api/articles', this.articleSelected, {params: {id: this.articleSelected._id}}).then(function (res) {
                    if (res.body.status === 1) {
                        _this.getArticle()
                    } else {
                        _this.$Message.error('编辑失败')
                    }
                    _this.articleModalShow  =false
                })
            },

            /**
             * 删除文章
             */
            deleteArticle() {
                let _this = this
                _this.$http.delete('api/articles', {params: {id: _this.articleSelected._id}}).then(function (res) {
                    if (res.body.status === 1) {
                        _this.getArticle()
                    } else {
                        _this.$Message.error('删除失败')
                    }
                    _this.deleteModalShow = false
                })
            },

            /**
             * 处理日期格式中间件
             */
            queryDateFilter(data) {
                for (let item of data) {
                    item.create_time = NUtil.Format(item.create_time, 'yyyy-MM-dd hh:mm:ss');
                    item.update_time = NUtil.Format(item.update_time, 'yyyy-MM-dd hh:mm:ss');
                }
            },

            // 加入群发列表
            addToMassSend(item) {
                this.massData.items.push(item)
            }
        },

        // watch: {
        //     massData() {
        //         this.massData.reduce((a, b) => console.log(a, b))
        //     }
        // },

        mounted(){
            this.getArticle()
            // this.initEditor()
        }


    }
</script>