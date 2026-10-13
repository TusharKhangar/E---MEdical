package com.spring.bioMedical.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityScheme;

/** Metadata for the generated API docs at /swagger-ui.html, with a Bearer-token "Authorize" button. */
@Configuration
public class OpenApiConfig {

	@Bean
	public OpenAPI eMedicalOpenApi() {
		return new OpenAPI()
				.info(new Info()
						.title("E-Medical API")
						.version("1.0")
						.description("""
								Hospital appointment API. Patients book doctors, doctors manage their schedule and \
								administrators run the clinic.

								To try protected endpoints: call `POST /api/login` with your account, copy `jwt` from the response, \
								click **Authorize** and paste it. Errors are returned as plain text.""")
						.license(new License().name("Apache 2.0").url("https://www.apache.org/licenses/LICENSE-2.0")))
				.components(new Components().addSecuritySchemes("bearer",
						new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT")));
	}
}
