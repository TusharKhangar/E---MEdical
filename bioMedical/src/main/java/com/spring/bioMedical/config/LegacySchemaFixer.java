package com.spring.bioMedical.config;

import java.util.List;

import javax.sql.DataSource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Databases created by earlier versions of this app have a UNIQUE index on {@code appointment.name},
 * which let each patient book only once. Hibernate's schema update never drops indexes, so this
 * removes it on start-up for MySQL. New databases are unaffected.
 */
@Component
@Order(1)
public class LegacySchemaFixer implements ApplicationRunner {

	private static final Logger logger = LoggerFactory.getLogger(LegacySchemaFixer.class);

	private final JdbcTemplate jdbc;

	public LegacySchemaFixer(DataSource dataSource) {
		this.jdbc = new JdbcTemplate(dataSource);
	}

	@Override
	public void run(ApplicationArguments args) {
		try {
			String product = jdbc.getDataSource().getConnection().getMetaData().getDatabaseProductName();
			if (product == null || !product.toLowerCase().contains("mysql")) {
				return;
			}
			List<String> indexes = jdbc.queryForList("""
					SELECT DISTINCT index_name FROM information_schema.statistics
					WHERE table_schema = DATABASE() AND table_name = 'appointment'
					  AND column_name = 'name' AND non_unique = 0 AND index_name <> 'PRIMARY'
					""", String.class);
			for (String index : indexes) {
				jdbc.execute("ALTER TABLE appointment DROP INDEX `" + index + "`");
				logger.info("Dropped legacy unique index {} on appointment.name", index);
			}
		} catch (Exception e) {
			logger.warn("Could not check for the legacy appointment.name index: {}", e.getMessage());
		}
	}
}
