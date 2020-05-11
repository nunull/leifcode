inlets = 2;
outlets  =2;
var deviceChannel;

function anything()
{
	
	
	var a = arrayfromargs(messagename, arguments);
	post("received message " + a + "\n");
	post("messagename ", messagename + "\n");
	post("arguments ", arguments + "\n");
	

	if(messagename === "msg_int"){
	deviceChannel = a;
	} else if (messagename === "/pattern/"+deviceChannel+"/values"){
	var parsed = JSON.parse(a[1]);
	if (parsed.length != 0){
		outlet(0, parsed);
	}else{
		outlet(0, "zlclear");
	}
	}  else if (messagename === "/pattern/"+deviceChannel+"/lengths"){
	
	outlet(1, JSON.parse(a[1]));
	}
	
	//bang();
}

function bang()
{
	outlet(0,"value",myval);
	outlet(0,"length", myval);
}