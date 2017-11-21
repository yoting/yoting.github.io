yoting博客系统原始文件，线上博客地址：http://yoting.github.com/blog
==========================================
文件和文件夹介绍：
	_config.yml：jekyll的配置文件，包含页面读取的内容信息，jekyll命令的默然参数等等
	GemFile:也是jekyll需要的配置文件
	index.html、404.html：分别是首页，404页面
	feed.xml：浏览器定制配置
	home文件夹：里面是首页需要展示的或者引用的文件，主要是一些md文件，被jekyll解析后放到指定的文件夹下，其中包括myinfo.md、
	assets文件夹：主要存放一些自己的资源文件，包括图片，js，css文件等
	_posts：原始md文件，最终会生成html的文件
	_inclueds：页面文件，包括saidbar等等
	_loayouts：都是页面布局相关的文件，比如post的布局，page的布局，default的布局等
	_plugins：jekyll插件
	_sass：jekyll资源文件
	_site：生成最终站点的所有的html文件，比如post文件最终生成的html文件以及其他md文件生成的html文件
assets：自己的资源文件，包括图片，css，js等
==========================================
jekyll命令：
	使用jekyll s命名运行，通过localhost:4000访问
	使用jekyll d命令部署，会将生成的post的html文件部署到yoting.github.io文件夹下（因为配置了生成文件目标位置）
	使用git相关命令备份到github的仓库中
==========================================
git相关命令：
	使用git status查看状态
	使用git add .添加文件
	使用git add --all添加包含被本地删除的文件
	使用git commit -m 'memo'提交本地git
	使用git push origin master推送本地master分支到github上
	使用git push origin gh-pages推送本地gh-pages分支到github上
	
	使用git clone xxx.git克隆项目到本地
	使用git init初始化本地文件夹
	使用git remote add origin xxx.git创建远程仓库连接
	使用git fetch/pull origin master从远程下载更新

