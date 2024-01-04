(window.webpackJsonp=window.webpackJsonp||[]).push([[119],{525:function(s,n,t){"use strict";t.r(n);var a=t(56),e=Object(a.a)({},(function(){var s=this,n=s.$createElement,t=s._self._c||n;return t("ContentSlotsDistributor",{attrs:{"slot-key":s.$parent.slotKey}},[t("h1",{attrs:{id:"k3s集群上安装kubesphre"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#k3s集群上安装kubesphre"}},[s._v("#")]),s._v(" k3s集群上安装kubesphre")]),s._v(" "),t("div",{staticClass:"language-bash line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-bash"}},[t("code",[s._v("root@k3s-master-1:/home/vagrant"),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# kubectl get sc")]),s._v("\nNAME                   PROVISIONER             RECLAIMPOLICY   VOLUMEBINDINGMODE      ALLOWVOLUMEEXPANSION   AGE\nlocal-path "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("default"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v("   rancher.io/local-path   Delete          WaitForFirstConsumer   "),t("span",{pre:!0,attrs:{class:"token boolean"}},[s._v("false")]),s._v("                  49m\nroot@k3s-master-1:/home/vagrant"),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# kubectl apply -f https://github.com/kubesphere/ks-installer/releases/download/v3.4.1/kubesphere-installer.yaml")]),s._v("\ncustomresourcedefinition.apiextensions.k8s.io/clusterconfigurations.installer.kubesphere.io created\nnamespace/kubesphere-system created\nserviceaccount/ks-installer created\nclusterrole.rbac.authorization.k8s.io/ks-installer created\nclusterrolebinding.rbac.authorization.k8s.io/ks-installer created\ndeployment.apps/ks-installer created\nroot@k3s-master-1:/home/vagrant"),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# kubectl apply -f https://github.com/kubesphere/ks-installer/releases/download/v3.4.1/cluster-configuration.yaml")]),s._v("\nclusterconfiguration.installer.kubesphere.io/ks-installer created\n\n"),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# 查看安装日志")]),s._v("\nkubectl logs -n kubesphere-system "),t("span",{pre:!0,attrs:{class:"token variable"}},[t("span",{pre:!0,attrs:{class:"token variable"}},[s._v("$(")]),s._v("kubectl get pod -n kubesphere-system -l "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v("'app in (ks-install, ks-installer)'")]),s._v(" -o "),t("span",{pre:!0,attrs:{class:"token assign-left variable"}},[s._v("jsonpath")]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),t("span",{pre:!0,attrs:{class:"token string"}},[s._v("'{.items[0].metadata.name}'")]),t("span",{pre:!0,attrs:{class:"token variable"}},[s._v(")")])]),s._v(" -f\n\n**************************************************\nWaiting "),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("for")]),s._v(" all tasks to be completed "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("..")]),s._v(".\ntask network status is successful  "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("1")]),s._v("/4"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v("\ntask openpitrix status is successful  "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("2")]),s._v("/4"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v("\ntask multicluster status is successful  "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("3")]),s._v("/4"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v("\n\n\n\n\ntask monitoring status is successful  "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("4")]),s._v("/4"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v("\n**************************************************\nCollecting installation results "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("..")]),s._v(".\n"),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#####################################################")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("###              Welcome to KubeSphere!           ###")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#####################################################")]),s._v("\n\nConsole: http://192.168.1.21:30880\nAccount: admin\nPassword: P@88w0rd\nNOTES：\n  "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("1")]),s._v(". After you log into the console, please check the\n     monitoring status of "),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("service")]),s._v(" components "),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("in")]),s._v("\n     "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"Cluster Management"')]),t("span",{pre:!0,attrs:{class:"token builtin class-name"}},[s._v(".")]),s._v(" If any "),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("service")]),s._v(" is not\n     ready, please "),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("wait")]),s._v(" patiently "),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("until")]),s._v(" all components\n     are up and running.\n  "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("2")]),s._v(". Please change the default password after login.\n\n"),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#####################################################")]),s._v("\nhttps://kubesphere.io             "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("2023")]),s._v("-12-18 "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("13")]),s._v(":58:39\n"),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#####################################################**************************************************")]),s._v("\nWaiting "),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("for")]),s._v(" all tasks to be completed "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("..")]),s._v(".\ntask network status is successful  "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("1")]),s._v("/4"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v("\ntask openpitrix status is successful  "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("2")]),s._v("/4"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v("\ntask multicluster status is successful  "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("3")]),s._v("/4"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v("\n\n\n\n\ntask monitoring status is successful  "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("4")]),s._v("/4"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v("\n**************************************************\nCollecting installation results "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("..")]),s._v(".\n"),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#####################################################")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("###              Welcome to KubeSphere!           ###")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#####################################################")]),s._v("\n\nConsole: http://192.168.1.21:30880\nAccount: admin\nPassword: P@88w0rd\nNOTES：\n  "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("1")]),s._v(". After you log into the console, please check the\n     monitoring status of "),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("service")]),s._v(" components "),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("in")]),s._v("\n     "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"Cluster Management"')]),t("span",{pre:!0,attrs:{class:"token builtin class-name"}},[s._v(".")]),s._v(" If any "),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("service")]),s._v(" is not\n     ready, please "),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("wait")]),s._v(" patiently "),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("until")]),s._v(" all components\n     are up and running.\n  "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("2")]),s._v(". Please change the default password after login.\n\n"),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#####################################################")]),s._v("\nhttps://kubesphere.io             "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("2023")]),s._v("-12-18 "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("13")]),s._v(":58:39\n"),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#####################################################")]),s._v("\n\n"),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# 查看相关pod运行状态")]),s._v("\nkubectl get svc/ks-console -n kubesphere-system\n\n\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br"),t("span",{staticClass:"line-number"},[s._v("2")]),t("br"),t("span",{staticClass:"line-number"},[s._v("3")]),t("br"),t("span",{staticClass:"line-number"},[s._v("4")]),t("br"),t("span",{staticClass:"line-number"},[s._v("5")]),t("br"),t("span",{staticClass:"line-number"},[s._v("6")]),t("br"),t("span",{staticClass:"line-number"},[s._v("7")]),t("br"),t("span",{staticClass:"line-number"},[s._v("8")]),t("br"),t("span",{staticClass:"line-number"},[s._v("9")]),t("br"),t("span",{staticClass:"line-number"},[s._v("10")]),t("br"),t("span",{staticClass:"line-number"},[s._v("11")]),t("br"),t("span",{staticClass:"line-number"},[s._v("12")]),t("br"),t("span",{staticClass:"line-number"},[s._v("13")]),t("br"),t("span",{staticClass:"line-number"},[s._v("14")]),t("br"),t("span",{staticClass:"line-number"},[s._v("15")]),t("br"),t("span",{staticClass:"line-number"},[s._v("16")]),t("br"),t("span",{staticClass:"line-number"},[s._v("17")]),t("br"),t("span",{staticClass:"line-number"},[s._v("18")]),t("br"),t("span",{staticClass:"line-number"},[s._v("19")]),t("br"),t("span",{staticClass:"line-number"},[s._v("20")]),t("br"),t("span",{staticClass:"line-number"},[s._v("21")]),t("br"),t("span",{staticClass:"line-number"},[s._v("22")]),t("br"),t("span",{staticClass:"line-number"},[s._v("23")]),t("br"),t("span",{staticClass:"line-number"},[s._v("24")]),t("br"),t("span",{staticClass:"line-number"},[s._v("25")]),t("br"),t("span",{staticClass:"line-number"},[s._v("26")]),t("br"),t("span",{staticClass:"line-number"},[s._v("27")]),t("br"),t("span",{staticClass:"line-number"},[s._v("28")]),t("br"),t("span",{staticClass:"line-number"},[s._v("29")]),t("br"),t("span",{staticClass:"line-number"},[s._v("30")]),t("br"),t("span",{staticClass:"line-number"},[s._v("31")]),t("br"),t("span",{staticClass:"line-number"},[s._v("32")]),t("br"),t("span",{staticClass:"line-number"},[s._v("33")]),t("br"),t("span",{staticClass:"line-number"},[s._v("34")]),t("br"),t("span",{staticClass:"line-number"},[s._v("35")]),t("br"),t("span",{staticClass:"line-number"},[s._v("36")]),t("br"),t("span",{staticClass:"line-number"},[s._v("37")]),t("br"),t("span",{staticClass:"line-number"},[s._v("38")]),t("br"),t("span",{staticClass:"line-number"},[s._v("39")]),t("br"),t("span",{staticClass:"line-number"},[s._v("40")]),t("br"),t("span",{staticClass:"line-number"},[s._v("41")]),t("br"),t("span",{staticClass:"line-number"},[s._v("42")]),t("br"),t("span",{staticClass:"line-number"},[s._v("43")]),t("br"),t("span",{staticClass:"line-number"},[s._v("44")]),t("br"),t("span",{staticClass:"line-number"},[s._v("45")]),t("br"),t("span",{staticClass:"line-number"},[s._v("46")]),t("br"),t("span",{staticClass:"line-number"},[s._v("47")]),t("br"),t("span",{staticClass:"line-number"},[s._v("48")]),t("br"),t("span",{staticClass:"line-number"},[s._v("49")]),t("br"),t("span",{staticClass:"line-number"},[s._v("50")]),t("br"),t("span",{staticClass:"line-number"},[s._v("51")]),t("br"),t("span",{staticClass:"line-number"},[s._v("52")]),t("br"),t("span",{staticClass:"line-number"},[s._v("53")]),t("br"),t("span",{staticClass:"line-number"},[s._v("54")]),t("br"),t("span",{staticClass:"line-number"},[s._v("55")]),t("br"),t("span",{staticClass:"line-number"},[s._v("56")]),t("br"),t("span",{staticClass:"line-number"},[s._v("57")]),t("br"),t("span",{staticClass:"line-number"},[s._v("58")]),t("br"),t("span",{staticClass:"line-number"},[s._v("59")]),t("br"),t("span",{staticClass:"line-number"},[s._v("60")]),t("br"),t("span",{staticClass:"line-number"},[s._v("61")]),t("br"),t("span",{staticClass:"line-number"},[s._v("62")]),t("br"),t("span",{staticClass:"line-number"},[s._v("63")]),t("br"),t("span",{staticClass:"line-number"},[s._v("64")]),t("br"),t("span",{staticClass:"line-number"},[s._v("65")]),t("br"),t("span",{staticClass:"line-number"},[s._v("66")]),t("br"),t("span",{staticClass:"line-number"},[s._v("67")]),t("br"),t("span",{staticClass:"line-number"},[s._v("68")]),t("br"),t("span",{staticClass:"line-number"},[s._v("69")]),t("br"),t("span",{staticClass:"line-number"},[s._v("70")]),t("br"),t("span",{staticClass:"line-number"},[s._v("71")]),t("br"),t("span",{staticClass:"line-number"},[s._v("72")]),t("br"),t("span",{staticClass:"line-number"},[s._v("73")]),t("br"),t("span",{staticClass:"line-number"},[s._v("74")]),t("br"),t("span",{staticClass:"line-number"},[s._v("75")]),t("br"),t("span",{staticClass:"line-number"},[s._v("76")]),t("br"),t("span",{staticClass:"line-number"},[s._v("77")]),t("br"),t("span",{staticClass:"line-number"},[s._v("78")]),t("br"),t("span",{staticClass:"line-number"},[s._v("79")]),t("br"),t("span",{staticClass:"line-number"},[s._v("80")]),t("br")])])])}),[],!1,null,null,null);n.default=e.exports}}]);