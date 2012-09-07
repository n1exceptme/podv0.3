<?php

require_once 'logger/error_log.php'; //enables printing log messages to logger/error_log.txt
require_once 'Request.php'; //uses client data sent to make query calls to class in charge.
require_once 'QueryOperation.php'; //class in charge of query operations


	$request_method = strtolower($_SERVER['REQUEST_METHOD']);  
	error_log( "type " . $request_method );
		
	$query = new QueryOperation();
	$result = new stdClass();
	
	function get_url_id()
	{
		$strip =  basename($_SERVER['REQUEST_URI']);
		$strip = explode( "?", $strip );
			
		if( count($strip) > 0 )
		{
			return $strip[0];				
		}
		
		return NULL;
	}
	
	
	switch( $request_method )
	{
		
		case 'get':
			$result = $query->getConsumo(new stdClass());
		break;
		
		
		case 'put':
			$put = file_get_contents("php://input", 'r' );
			$params = json_decode( $put );
			$result = $query->updateConsumo($params);
			
		break;
		
		case 'post':
			$put = file_get_contents("php://input", 'r' );
			$params = json_decode( $put );
			$result = $query->createConsumo($params);
		break;
		
		case 'delete':
			$id = get_url_id();
			$params = new stdClass();
			$params->id = $id;
			$result = $query->destroyConsumo($params);
		break;
		
	}
	
	echo json_encode( $result );
	
?>