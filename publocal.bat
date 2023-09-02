copy ..\bet-app-out\.env ..\bet-app-out\.env_old
xcopy *.* /v /y ..\bet-app-out\
xcopy /s /v /y jslibs\*.* ..\bet-app-out\jslibs\
xcopy /s /v /y app-ux\amznkey ..\bet-app-out\app-ux\amznkey\
xcopy /s /v /y app-ux\dist ..\bet-app-out\app-ux\dist\