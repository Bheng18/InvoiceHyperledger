# Hyperledger Invoice Case Study
**Joebert Fundador** - February 2019

## Pre-requisites
> The pre-requisites in this study to develop an invoice Hyperledger Fabric 
* Go 1.11.5
* Hyperledger Fabric
* VS Code 1.30
* NodeJS
* Postman
* Ubuntu 16.04/18.04 LTS 
* Docker 
* Docker Compose
* Git

## Step
### Hyperledger fabric Installation
1. Go to this link: https://hyperledger.github.io/composer/latest/installing/installing-prereqs.html

### Installing git
1. Follow installation guide  https://git-scm.com/book/en/v2/Getting-Started-Installing-Git

### Installing Go:
1. Go to the link: https://golang.org/dl/
2. Select versions base on your system Operating System
3. In my case, I download Linux Version go1.11.5.linux-amd64.tar.gz
4. Extract it into /usr/local, creating a Go tree in /usr/local/go. 
   For example: tar -C /usr/local -xzf go$VERSION.$OS-$ARCH.tar.gz
5. Or use the terminal execution by the use of this command when you open the terminal. ‘sudo snap install go --classic’
6. Export the path so that your extracted files that you’ve installed with it. Execute on this terminal
* export GOROOT=/usr/local/go
* export GOPATH=$HOME/go
* export PATH=$GOPATH/bin:$GOROOT/bin:$PATH

### Installing VSCode:
1. Go to this link: https://code.visualstudio.com/ . 

### Installing Postman:
1. Goto this link: https://www.getpostman.com/downloads/

## Running the Invoice application into our machine
1. Go to Link:
   1. https://github.com/hyperledger/fabric-samples 
   2. https://github.com/bchinc/blockchain-training-labs

2. Click Clone or Download this 2 repositories.
   
   ![Git](https://github.com/Bheng18/InvoiceHyperledger/blob/master/DeepinScreenshot_select-area_20190215104313.png)
  
   ![Git](https://github.com/Bheng18/InvoiceHyperledger/blob/master/DeepinScreenshot_select-area_20190215105503.png)
 
3. Go to Terminal then execute this command
      1. $ git clone https://github.com/hyperledger/fabric-samples.git
      2. $ git clone https://github.com/bchinc/blockchain-training-labs.git

4. Go to fabric-samples/ folder and create new folder name invoice
     
  * $ cd fabric-samples/invoice

> Create another folder inside fabric-samples and name it **chaincode**
> Create folder name **invoice** inside chaincode then another folder name **go** inside invoice folder 

   * $ cd fabric-samples/chaincode/invoice/go

5. Go to **blockchain-training-labs\go** folder and copy **fabcar.go** files and paste it to **fabric-samples/chaincode/invoice/go** folder
   * $ cd fabric-samples/chaincode/invoice/go

6. Rename **fabcar.go** into **invoice.go** 

   * $ cd fabric-samples/chaincode/invoice/go 
   ![Git](https://github.com/Bheng18/InvoiceHyperledger/blob/master/DeepinScreenshot_select-area_20190215110913.png)

7. Go to **blockchain-training-labs\node** folder and copy five files **app.js, enrollAdmin.js, package.json, registerUser.js and startFabric.sh** and paste it to **/fabric-samples/invoice** folder
     1. COPY from blockchain-training-labs\node folder
     ![](https://github.com/Bheng18/InvoiceHyperledger/blob/master/DeepinScreenshot_select-area_20190215111115.png)
     
     2. PASTE to /fabric-samples/invoice folder
     ![](https://github.com/Bheng18/InvoiceHyperledger/blob/master/DeepinScreenshot_select-area_20190215111743.png)

8. Go to **fabric-samples\basic-network** folder and open Terminal

9. Run this command **./teardown.sh** to clean the docker images of our network
    ![](https://github.com/Bheng18/InvoiceHyperledger/blob/master/DeepinScreenshot_select-area_20190215113140.png)

10. Output of **./teardown** command
    ![](https://github.com/Bheng18/InvoiceHyperledger/blob/master/DeepinScreenshot_select-area_20190215113418.png)

11. Go to **/fabric-samples/invoice** folder and run **./startFabric.sh** command

     * $ cd fabric-samples/invoice 
     ![](https://github.com/Bheng18/InvoiceHyperledger/blob/master/DeepinScreenshot_select-area_20190215114434.png)
     
     * Output
     
      ![](https://github.com/Bheng18/InvoiceHyperledger/blob/master/DeepinScreenshot_select-area_20190215114729.png)

12. Open in your browser: **http://localhost:5984/_utils/** and click **mychannel_invoice** to view

13. In your terminal inside **/fabric-samples/invoice** folder run **“node enrollAdmin.js”, “node registerUser.js” and “node app.js”**

    * output: 
     ![](https://github.com/Bheng18/InvoiceHyperledger/blob/master/DeepinScreenshot_select-area_20190215115232.png)

14. In postman Open **localhost:3000** to get data and Open **localhost:3000/invoice** to post data

15. In post request Enter this fields.

| key | value |
| --- | --- |
| Username | IBM |
| Invoiceid | INVOICE1 |
| Invoicenum | 1 |
| Billedto | <any name> |
| Invoicedate | 2/14/2019 |
| Invoiceamount | 0 |
| itemdescription | <any description> |
| Gr | false |
| ispaid | false |
| paidamount | 0 |
| repaid | false |
| Repaymentamount	| 0 |
    
    
    



