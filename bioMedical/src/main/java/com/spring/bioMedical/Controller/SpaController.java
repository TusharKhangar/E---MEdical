package com.spring.bioMedical.Controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * When the React build is packaged inside this jar (see the Dockerfile), browser routes such as
 * {@code /dashboard/appointments} or {@code /set-password?token=...} must load the app instead of
 * a 404. Anything under /api or /actuator, and any path with a file extension, is left alone.
 */
@Controller
public class SpaController {

	@GetMapping({ "/{path:^(?!api$|actuator$|assets$|swagger-ui$|v3$)[^.]*}", "/{path:^(?!api$|actuator$|assets$|swagger-ui$|v3$)[^.]*}/**" })
	public String forwardToReactApp() {
		return "forward:/index.html";
	}
}
